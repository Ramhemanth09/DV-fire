using System.Collections;
using UnityEngine;
using ShadowIsland.Core;
using ShadowIsland.Player;

namespace ShadowIsland.Weapons
{
    public class WeaponController : MonoBehaviour
    {
        [Header("Weapon Configuration")]
        [SerializeField] private WeaponData weaponData;
        [SerializeField] private Transform muzzlePoint;
        [SerializeField] private LayerMask hitLayers;

        [Header("Runtime State")]
        [SerializeField] private int currentMagazine;
        [SerializeField] private int currentReserveAmmo;
        [SerializeField] private bool isReloading;

        // Recoil Kick tracking
        private float nextFireTime;
        private Vector2 currentRecoil;
        private PlayerController playerController;
        private AudioSource audioSource;

        public WeaponData Data => weaponData;
        public int CurrentMagazine => currentMagazine;
        public int CurrentReserveAmmo => currentReserveAmmo;
        public bool IsReloading => isReloading;

        public event System.Action<int, int> OnAmmoChanged; // mag, reserve
        public event System.Action OnFired;
        public event System.Action<bool> OnReloadStatusChanged; // isReloading
        public event System.Action<HitboxType, float> OnHitConfirmed; // for hitmarker UI

        private void Awake()
        {
            playerController = GetComponentInParent<PlayerController>();
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null) audioSource = gameObject.AddComponent<AudioSource>();

            if (weaponData != null)
            {
                currentMagazine = weaponData.magazineCapacity;
                currentReserveAmmo = weaponData.maxReserveAmmo;
            }
        }

        private void Start()
        {
            OnAmmoChanged?.Invoke(currentMagazine, currentReserveAmmo);
        }

        private void Update()
        {
            HandleRecoilRecovery();
            HandleInput();
        }

        private void HandleInput()
        {
            // Only accept player input if attached to human player
            if (playerController == null) return;

            // Firing
            bool wantsToFire = weaponData.fireMode == FireMode.Automatic ? Input.GetMouseButton(0) : Input.GetMouseButtonDown(0);
            if (wantsToFire && CanShoot())
            {
                Shoot();
            }

            // Reload (R)
            if (Input.GetKeyDown(KeyCode.R) && CanReload())
            {
                StartCoroutine(ReloadRoutine());
            }
        }

        public bool CanShoot()
        {
            return Time.time >= nextFireTime && !isReloading && currentMagazine > 0;
        }

        public bool CanReload()
        {
            return !isReloading && currentMagazine < weaponData.magazineCapacity && currentReserveAmmo > 0;
        }

        public void Shoot()
        {
            nextFireTime = Time.time + weaponData.TimeBetweenShots;
            currentMagazine--;
            OnAmmoChanged?.Invoke(currentMagazine, currentReserveAmmo);
            OnFired?.Invoke();

            // Gunshot Sound
            if (weaponData.fireSound != null && audioSource != null)
            {
                audioSource.pitch = Random.Range(0.96f, 1.04f);
                audioSource.PlayOneShot(weaponData.fireSound);
            }

            // Gunshot Sound Broadcast for AI Hearing
            BroadcastGunshotNoise(transform.position, 60f);

            // Muzzle Flash
            if (weaponData.muzzleFlashPrefab != null && muzzlePoint != null)
            {
                GameObject flash = Instantiate(weaponData.muzzleFlashPrefab, muzzlePoint.position, muzzlePoint.rotation, muzzlePoint);
                Destroy(flash, 0.08f);
            }

            // Raycast Calculation from Camera Center (or Muzzle forward for AI)
            Vector3 rayOrigin;
            Vector3 rayDirection;

            bool isAiming = playerController != null && playerController.IsAiming;
            float currentSpread = isAiming ? weaponData.adsSpreadAngle : weaponData.hipfireSpreadAngle;

            if (Camera.main != null && playerController != null)
            {
                Ray camRay = Camera.main.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
                rayOrigin = camRay.origin;
                rayDirection = ApplyBulletSpread(camRay.direction, currentSpread);
            }
            else
            {
                rayOrigin = muzzlePoint.position;
                rayDirection = ApplyBulletSpread(muzzlePoint.forward, currentSpread);
            }

            // Apply Recoil Kick
            ApplyRecoilKick();

            Vector3 hitTargetPoint;

            if (Physics.Raycast(rayOrigin, rayDirection, out RaycastHit hit, weaponData.effectiveRange, hitLayers))
            {
                hitTargetPoint = hit.point;

                // Process Damage if hit an entity
                HitboxReceiver hitbox = hit.collider.GetComponent<HitboxReceiver>();
                if (hitbox != null)
                {
                    hitbox.RegisterHit(weaponData.baseDamage, hit.point, gameObject);
                    OnHitConfirmed?.Invoke(hitbox.GetHitboxType(), weaponData.baseDamage);
                }
                else
                {
                    HealthSystem directHealth = hit.collider.GetComponentInParent<HealthSystem>();
                    if (directHealth != null)
                    {
                        directHealth.TakeDamage(weaponData.baseDamage, HitboxType.Body, hit.point, gameObject);
                        OnHitConfirmed?.Invoke(HitboxType.Body, weaponData.baseDamage);
                    }
                }

                // Spawn Impact Effect
                SpawnImpactEffect(hit);
            }
            else
            {
                hitTargetPoint = rayOrigin + (rayDirection * weaponData.effectiveRange);
            }

            // Bullet Tracer
            if (weaponData.bulletTracerPrefab != null && muzzlePoint != null)
            {
                StartCoroutine(SpawnTracerRoutine(muzzlePoint.position, hitTargetPoint));
            }

            // Auto-reload if magazine is empty
            if (currentMagazine <= 0 && currentReserveAmmo > 0)
            {
                StartCoroutine(ReloadRoutine());
            }
        }

        private Vector3 ApplyBulletSpread(Vector3 direction, float spreadAngle)
        {
            float spreadRad = spreadAngle * Mathf.Deg2Rad;
            Vector3 spreadOffset = Random.insideUnitSphere * Mathf.Tan(spreadRad);
            return (direction + spreadOffset).normalized;
        }

        private void ApplyRecoilKick()
        {
            float pitchKick = Random.Range(weaponData.verticalRecoilMin, weaponData.verticalRecoilMax);
            float yawKick = Random.Range(weaponData.horizontalRecoilMin, weaponData.horizontalRecoilMax);
            currentRecoil += new Vector2(yawKick, pitchKick);
        }

        private void HandleRecoilRecovery()
        {
            currentRecoil = Vector2.Lerp(currentRecoil, Vector2.zero, Time.deltaTime * weaponData.recoilRecoverySpeed);
        }

        private IEnumerator ReloadRoutine()
        {
            isReloading = true;
            OnReloadStatusChanged?.Invoke(true);

            if (weaponData.reloadSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(weaponData.reloadSound);
            }

            yield return new WaitForSeconds(weaponData.reloadDuration);

            int neededAmmo = weaponData.magazineCapacity - currentMagazine;
            int ammoToAdd = Mathf.Min(neededAmmo, currentReserveAmmo);

            currentMagazine += ammoToAdd;
            currentReserveAmmo -= ammoToAdd;

            isReloading = false;
            OnReloadStatusChanged?.Invoke(false);
            OnAmmoChanged?.Invoke(currentMagazine, currentReserveAmmo);
        }

        private IEnumerator SpawnTracerRoutine(Vector3 startPos, Vector3 targetPos)
        {
            GameObject tracer = Instantiate(weaponData.bulletTracerPrefab, startPos, Quaternion.identity);
            LineRenderer lr = tracer.GetComponent<LineRenderer>();
            
            float elapsed = 0f;
            float duration = 0.04f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                if (lr != null)
                {
                    lr.SetPosition(0, Vector3.Lerp(startPos, targetPos, elapsed / duration));
                    lr.SetPosition(1, targetPos);
                }
                yield return null;
            }

            Destroy(tracer, 0.02f);
        }

        private void SpawnImpactEffect(RaycastHit hit)
        {
            GameObject prefabToSpawn = weaponData.hitVFXGroundPrefab;
            if (hit.collider.CompareTag("Metal") && weaponData.hitVFXMetalPrefab != null)
            {
                prefabToSpawn = weaponData.hitVFXMetalPrefab;
            }

            if (prefabToSpawn != null)
            {
                GameObject vfx = Instantiate(prefabToSpawn, hit.point + (hit.normal * 0.02f), Quaternion.LookRotation(hit.normal));
                Destroy(vfx, 1.5f);
            }
        }

        private void BroadcastGunshotNoise(Vector3 origin, float noiseRadius)
        {
            Collider[] listeners = Physics.OverlapSphere(origin, noiseRadius);
            foreach (var col in listeners)
            {
                var ai = col.GetComponent<AI.EnemyAIController>();
                if (ai != null && ai.gameObject != gameObject)
                {
                    ai.OnHearGunshot(origin);
                }
            }
        }
    }
}
