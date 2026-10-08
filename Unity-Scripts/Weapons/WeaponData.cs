using UnityEngine;

namespace ShadowIsland.Weapons
{
    public enum WeaponType
    {
        AssaultRifle,
        Shotgun,
        SMG,
        SniperRifle,
        Pistol
    }

    public enum FireMode
    {
        Automatic,
        SemiAutomatic,
        Burst
    }

    [CreateAssetMenu(fileName = "NewWeaponData", menuName = "ShadowIsland/Weapon Data")]
    public class WeaponData : ScriptableObject
    {
        [Header("General Info")]
        public string weaponName = "M4A1 Shadow AR";
        public WeaponType weaponType = WeaponType.AssaultRifle;
        public FireMode fireMode = FireMode.Automatic;

        [Header("Ballistics & Damage")]
        public float baseDamage = 32f;
        public float fireRateRPM = 680f; // Rounds Per Minute
        public float effectiveRange = 150f;
        public float muzzleVelocity = 850f;

        [Header("Ammo & Reload")]
        public int magazineCapacity = 30;
        public int maxReserveAmmo = 180;
        public float reloadDuration = 2.2f;

        [Header("Accuracy & Spread")]
        public float hipfireSpreadAngle = 2.4f;
        public float adsSpreadAngle = 0.5f;

        [Header("Recoil Pattern")]
        public float verticalRecoilMin = 1.2f;
        public float verticalRecoilMax = 1.8f;
        public float horizontalRecoilMin = -0.6f;
        public float horizontalRecoilMax = 0.6f;
        public float recoilRecoverySpeed = 6.0f;

        [Header("VFX & Audio References")]
        public GameObject muzzleFlashPrefab;
        public GameObject bulletTracerPrefab;
        public GameObject hitVFXGroundPrefab;
        public GameObject hitVFXMetalPrefab;
        public AudioClip fireSound;
        public AudioClip reloadSound;
        public AudioClip dryFireSound;

        public float TimeBetweenShots => 60f / fireRateRPM;
    }
}
