using UnityEngine;

namespace ShadowIsland.Core
{
    /// <summary>
    /// Attached to individual limb and head colliders to route damage to the root HealthSystem.
    /// </summary>
    public class HitboxReceiver : MonoBehaviour
    {
        [SerializeField] private HitboxType hitboxType = HitboxType.Body;
        [SerializeField] private HealthSystem rootHealthSystem;

        private void Awake()
        {
            if (rootHealthSystem == null)
            {
                rootHealthSystem = GetComponentInParent<HealthSystem>();
            }
        }

        public void RegisterHit(float damage, Vector3 hitPoint, GameObject attacker)
        {
            if (rootHealthSystem != null)
            {
                rootHealthSystem.TakeDamage(damage, hitboxType, hitPoint, attacker);
            }
        }

        public HitboxType GetHitboxType() => hitboxType;
    }
}
