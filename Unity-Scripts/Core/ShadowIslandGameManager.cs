using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace ShadowIsland.Core
{
    public enum MatchMode
    {
        StandardBattleRoyale,
        EndlessSurvival
    }

    /// <summary>
    /// GameManager supporting both Standard Battle Royale and Endless Multi-Bot Survival.
    /// In Endless Survival mode, eliminated bots continuously trigger reinforcements,
    /// and the match never ends until the player dies.
    /// </summary>
    public class ShadowIslandGameManager : MonoBehaviour
    {
        public static ShadowIslandGameManager Instance { get; private set; }

        [Header("Match Mode Settings")]
        [SerializeField] private MatchMode mode = MatchMode.EndlessSurvival;
        [SerializeField] private int maxConcurrentBots = 6;
        [SerializeField] private Transform[] botSpawnPoints;
        [SerializeField] private GameObject[] botPrefabs;

        [Header("Runtime Match Stats")]
        [SerializeField] private MatchState currentState = MatchState.ActiveCombat;
        [SerializeField] private int playerKills;
        [SerializeField] private float matchTimeElapsed;
        [SerializeField] private List<GameObject> activeBots = new List<GameObject>();

        public int PlayerKills => playerKills;
        public MatchState State => currentState;

        public event Action<int> OnPlayerKillsChanged;
        public event Action<string, string> OnKillFeedEntry; // killer, victim
        public event Action<bool, int, int, float> OnMatchFinished; // isVictory, rank, kills, timeElapsed

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            SpawnInitialSquad();
        }

        private void Update()
        {
            if (currentState == MatchState.ActiveCombat)
            {
                matchTimeElapsed += Time.deltaTime;
            }
        }

        private void SpawnInitialSquad()
        {
            int countToSpawn = Mathf.Min(maxConcurrentBots, botSpawnPoints.Length);
            for (int i = 0; i < countToSpawn; i++)
            {
                SpawnBotAtPoint(botSpawnPoints[i]);
            }
        }

        private void SpawnBotAtPoint(Transform spawnPoint)
        {
            if (botPrefabs == null || botPrefabs.Length == 0 || spawnPoint == null) return;

            GameObject prefab = botPrefabs[UnityEngine.Random.Range(0, botPrefabs.Length)];
            GameObject bot = Instantiate(prefab, spawnPoint.position, spawnPoint.rotation);
            activeBots.Add(bot);

            HealthSystem botHealth = bot.GetComponent<HealthSystem>();
            if (botHealth != null)
            {
                string botName = bot.name.Replace("(Clone)", "");
                botHealth.OnKilled += (killer) => HandleBotElimination(bot, botName, killer);
            }
        }

        private void HandleBotElimination(GameObject bot, string botName, GameObject killer)
        {
            activeBots.Remove(bot);

            bool killedByPlayer = (killer != null && killer.CompareTag("Player"));
            if (killedByPlayer)
            {
                playerKills++;
                OnPlayerKillsChanged?.Invoke(playerKills);
            }

            string killerName = killedByPlayer ? "YOU" : "AIR_COMMAND";
            OnKillFeedEntry?.Invoke(killerName, botName);

            // In Endless Survival, continually schedule tactical bot reinforcements
            if (mode == MatchMode.EndlessSurvival && currentState == MatchState.ActiveCombat)
            {
                StartCoroutine(ReinforcementRoutine());
            }
        }

        private IEnumerator ReinforcementRoutine()
        {
            yield return new WaitForSeconds(3.0f);
            if (currentState == MatchState.ActiveCombat && botSpawnPoints.Length > 0)
            {
                Transform randomPoint = botSpawnPoints[UnityEngine.Random.Range(0, botSpawnPoints.Length)];
                SpawnBotAtPoint(randomPoint);
            }
        }

        public void HandlePlayerDeath()
        {
            currentState = MatchState.MatchOver;
            OnMatchFinished?.Invoke(false, 1, playerKills, matchTimeElapsed);
        }
    }
}
