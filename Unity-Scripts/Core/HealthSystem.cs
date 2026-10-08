using System;
using UnityEngine;

namespace ShadowIsland.Core
{
    public enum HitboxType
    {
        Head,
        Body,
        Limb
    }

    public enum ArmorLevel
    {
        None = 0,
        Level1 = 1, // 20% reduction
        Level2 = 2, // 35% reduction
        Level3 = 3  // 50% reduction
    }

    public enum HelmetLevel
    {
        None = 0,
        Level1 = 1, // 25% headshot reduction
        Level2 = 2, // 40% headshot reduction
        Level3 = 3  // 55% headshot reduction
    }

    /// <summary>
    /// Core Health and Armor System for Player and AI.
    /// Handles realistic damage reduction, hitbox multipliers, and survival events.
    /// </summary>
    public class HealthSystem : MonoBehaviour
    {
        [Header("Health Settings")]
        [SerializeField] private float maxHealth = 100f;
        [SerializeField] private float currentHealth;

        [Header("Armor & Helmet")]
        [SerializeField] private ArmorLevel armorTier = ArmorLevel.Level2;
        [SerializeField] private float armorDurability = 100f;
        [SerializeField] private HelmetLevel helmetTier = HelmetLevel.Level2;
        [SerializeField] private float helmetDurability = 100f;

        [Header("Damage Multipliers")]
        [SerializeField] private float headMultiplier = 2.0f;
        [SerializeField] private float bodyMultiplier = 1.0f;
        [SerializeField] private float limbMultiplier = 0.75f;

        public bool IsDead { get; private set; }
        public float CurrentHealth => currentHealth;
        public float MaxHealth => maxHealth;
        public float ArmorDurability => armorDurability;

        // Events for UI and Sound
        public event Action<float, float> OnHealthChanged;
        public event Action<float, float> OnArmorChanged;
        public event Action<float, Vector3, bool> OnDamageTaken; // damage, hitPoint, isHeadshot
        public event Action<GameObject> OnKilled; // killer

        private void Awake()
        {
            currentHealth = maxHealth;
            IsDead = false;
        }

        private void Start()
        {
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnArmorChanged?.Invoke(armorDurability, 100f);
        }

        /// <summary>
        /// Applies incoming damage factoring in hitbox type and armor tiers.
        /// </summary>
        public void TakeDamage(float rawDamage, HitboxType hitbox, Vector3 hitPoint, GameObject attacker = null)
        {
            if (IsDead) return;

            float calculatedDamage = rawDamage;
            bool isHeadshot = (hitbox == HitboxType.Head);

            // Apply Hitbox Multiplier
            switch (hitbox)
            {
                case HitboxType.Head:
                    calculatedDamage *= headMultiplier;
                    // Helmet mitigation
                    if (helmetTier != HelmetLevel.None && helmetDurability > 0f)
                    {
                        float helmetMitigation = GetHelmetMitigationPercent(helmetTier);
                        float absorbed = calculatedDamage * helmetMitigation;
                        calculatedDamage -= absorbed;
                        helmetDurability = Mathf.Max(0f, helmetDurability - (absorbed * 0.5f));
                    }
                    break;

                case HitboxType.Body:
                    calculatedDamage *= bodyMultiplier;
                    // Armor vest mitigation
                    if (armorTier != ArmorLevel.None && armorDurability > 0f)
                    {
                        float armorMitigation = GetArmorMitigationPercent(armorTier);
                        float absorbed = calculatedDamage * armorMitigation;
                        calculatedDamage -= absorbed;
                        armorDurability = Mathf.Max(0f, armorDurability - (absorbed * 0.6f));
                        OnArmorChanged?.Invoke(armorDurability, 100f);
                    }
                    break;

                case HitboxType.Limb:
                    calculatedDamage *= limbMultiplier;
                    break;
            }

            currentHealth = Mathf.Max(0f, currentHealth - calculatedDamage);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnDamageTaken?.Invoke(calculatedDamage, hitPoint, isHeadshot);

            if (currentHealth <= 0f && !IsDead)
            {
                Die(attacker);
            }
        }

        private float GetArmorMitigationPercent(ArmorLevel level) => level switch
        {
            ArmorLevel.Level1 => 0.20f,
            ArmorLevel.Level2 => 0.35f,
            ArmorLevel.Level3 => 0.50f,
            _ => 0f
        };

        private float GetHelmetMitigationPercent(HelmetLevel level) => level switch
        {
            HelmetLevel.Level1 => 0.25f,
            HelmetLevel.Level2 => 0.40f,
            HelmetLevel.Level3 => 0.55f,
            _ => 0f
        };

        public void Heal(float amount)
        {
            if (IsDead) return;
            currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }

        public void RepairArmor(float amount, ArmorLevel newTier = ArmorLevel.None)
        {
            if (newTier != ArmorLevel.None) armorTier = newTier;
            armorDurability = Mathf.Min(100f, armorDurability + amount);
            OnArmorChanged?.Invoke(armorDurability, 100f);
        }

        private void Die(GameObject killer)
        {
            IsDead = true;
            OnKilled?.Invoke(killer);
        }
    }
}
