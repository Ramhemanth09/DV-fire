using System.Collections;
using UnityEngine;
using UnityEngine.AI;
using ShadowIsland.Core;
using ShadowIsland.Weapons;

namespace ShadowIsland.AI
{
    public enum ThreatTier
    {
        Recruit = 1,   // Kills 0-3: Slow reaction (1.5s), low accuracy (20%), low damage
        Veteran = 2,   // Kills 4-8: Moderate reaction (0.8s), moderate accuracy (35%)
        SpecOps = 3,   // Kills 9-15: Fast reaction (0.5s), high accuracy (55%), flanking
        ApexElite = 4  // Kills 16+: Lethal reaction (0.25s), peak accuracy (75%)
    }

    [RequireComponent(typeof(NavMeshAgent))]
    [RequireComponent(typeof(HealthSystem))]
    public class EnemyAIController : MonoBehaviour
    {
        [Header("AI Identity & Current Threat Tier")]
        [SerializeField] private ThreatTier currentTier = ThreatTier.Recruit;
        [SerializeField] private string botName = "Scout_Recruit";

        [Header("Perception Configuration")]
        [SerializeField] private float visionDistance = 65f;
        [SerializeField] private float visionAngle = 100f;
        [SerializeField] private Transform eyesTransform;
        [SerializeField] private LayerMask obstructionLayer;

        [Header("Combat Tuning")]
        [SerializeField] private WeaponController weaponController;
        [SerializeField] private float lowHealthCoverThreshold = 35f;

        // Internal State
        private NavMeshAgent agent;
        private HealthSystem healthSystem;
        private Transform playerTarget;
        private bool hasLineOfSight;
        private float spotTimer;
        private float nextBurstTime;
        private float nextStrafeTime;
        private bool isStrafingRight;

        // Threat Tier Profile Attributes
        private float reactionDelay = 1.5f;
        private float hitAccuracySpread = 0.22f;
        private float burstCooldown = 1.8f;
        private float damageMultiplier = 0.5f;

        public string BotName => botName;

        private void Awake()
        {
            agent = GetComponent<NavMeshAgent>();
            healthSystem = GetComponent<HealthSystem>();
            if (eyesTransform == null) eyesTransform = transform;
            ApplyTierProfile(currentTier);
        }

        private void Start()
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) playerTarget = playerObj.transform;

            StartCoroutine(AIDecisionLoop());
        }

        public void SetThreatTier(ThreatTier newTier)
        {
            currentTier = newTier;
            ApplyTierProfile(newTier);
        }

        private void ApplyTierProfile(ThreatTier tier)
        {
            switch (tier)
            {
                case ThreatTier.Recruit:
                    reactionDelay = 1.5f;
                    hitAccuracySpread = 0.22f;
                    burstCooldown = 1.8f;
                    damageMultiplier = 0.4f;
                    agent.speed = 3.2f;
                    break;
                case ThreatTier.Veteran:
                    reactionDelay = 0.85f;
                    hitAccuracySpread = 0.14f;
                    burstCooldown = 1.2f;
                    damageMultiplier = 0.7f;
                    agent.speed = 4.2f;
                    break;
                case ThreatTier.SpecOps:
                    reactionDelay = 0.5f;
                    hitAccuracySpread = 0.08f;
                    burstCooldown = 0.7f;
                    damageMultiplier = 1.0f;
                    agent.speed = 5.2f;
                    break;
                case ThreatTier.ApexElite:
                    reactionDelay = 0.25f;
                    hitAccuracySpread = 0.04f;
                    burstCooldown = 0.4f;
                    damageMultiplier = 1.3f;
                    agent.speed = 6.0f;
                    break;
            }
        }

        private void Update()
        {
            if (healthSystem.IsDead) return;

            EvaluatePerception();
            HandleCombatEngagement();
        }

        private void EvaluatePerception()
        {
            if (playerTarget == null) return;

            Vector3 dir = (playerTarget.position + Vector3.up * 1.2f) - eyesTransform.position;
            float dist = dir.magnitude;
            hasLineOfSight = false;

            if (dist <= visionDistance)
            {
                float angle = Vector3.Angle(eyesTransform.forward, dir);
                if (angle <= visionAngle * 0.5f)
                {
                    if (!Physics.Raycast(eyesTransform.position, dir.normalized, dist, obstructionLayer))
                    {
                        hasLineOfSight = true;
                    }
                }
            }

            if (hasLineOfSight)
            {
                spotTimer += Time.deltaTime;
            }
            else
            {
                spotTimer = 0f;
            }
        }

        private void HandleCombatEngagement()
        {
            if (playerTarget == null || !hasLineOfSight) return;

            // Face player
            Vector3 targetDir = (playerTarget.position - transform.position).normalized;
            targetDir.y = 0;
            if (targetDir != Vector3.zero)
            {
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(targetDir), Time.deltaTime * 6f);
            }

            // Only fire once the spotting/reaction hesitation period has elapsed
            if (spotTimer >= reactionDelay && Time.time >= nextBurstTime && weaponController != null)
            {
                nextBurstTime = Time.time + burstCooldown;
                if (weaponController.CanShoot())
                {
                    weaponController.Shoot();
                }
            }
        }

        private IEnumerator AIDecisionLoop()
        {
            while (!healthSystem.IsDead)
            {
                yield return new WaitForSeconds(Random.Range(0.4f, 0.7f));
                if (playerTarget == null) continue;

                float hpPercent = (healthSystem.CurrentHealth / healthSystem.MaxHealth) * 100f;
                if (hpPercent <= lowHealthCoverThreshold)
                {
                    // Retreat behind cover
                    Vector3 away = (transform.position - playerTarget.position).normalized;
                    agent.SetDestination(transform.position + away * 10f);
                }
            }
        }
    }
}
