using UnityEngine;
using ShadowIsland.Core;

namespace ShadowIsland.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement Speeds")]
        [SerializeField] private float walkSpeed = 4.5f;
        [SerializeField] private float sprintSpeed = 8.5f;
        [SerializeField] private float crouchSpeed = 2.8f;
        [SerializeField] private float adsSpeed = 3.2f;

        [Header("Physics & Gravity")]
        [SerializeField] private float gravity = -20.0f;
        [SerializeField] private float jumpHeight = 1.8f;

        [Header("Camera Alignment")]
        [SerializeField] private Transform cameraTransform;
        [SerializeField] private float turnSmoothTime = 0.08f;

        [Header("Crouch Configuration")]
        [SerializeField] private float standingHeight = 1.9f;
        [SerializeField] private float crouchingHeight = 1.1f;
        [SerializeField] private Vector3 standingCenter = new Vector3(0, 0.95f, 0);
        [SerializeField] private Vector3 crouchingCenter = new Vector3(0, 0.55f, 0);
        [SerializeField] private float crouchTransitionSpeed = 10f;

        [Header("Grenade Throw Settings")]
        [SerializeField] private GameObject fragGrenadePrefab;
        [SerializeField] private Transform grenadeThrowOrigin;
        [SerializeField] private float throwForce = 22f;

        private CharacterController characterController;
        private HealthSystem healthSystem;
        private float verticalVelocity;
        private float turnSmoothVelocity;
        private bool isGrounded;
        private bool isCrouching;
        private bool isSprinting;
        private bool isAiming;

        public bool IsAiming => isAiming;
        public bool IsCrouching => isCrouching;
        public bool IsSprinting => isSprinting;
        public Vector3 Velocity => characterController.velocity;

        // Events
        public event System.Action<string> OnTacticalShoutTriggered;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            healthSystem = GetComponent<HealthSystem>();
            if (cameraTransform == null && Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            HandleGroundedCheck();
            HandleInput();
            HandleMovement();
            HandleCrouchStance();
        }

        private void HandleGroundedCheck()
        {
            isGrounded = characterController.isGrounded;
            if (isGrounded && verticalVelocity < 0)
            {
                verticalVelocity = -2f;
            }
        }

        private void HandleInput()
        {
            // Toggle Crouch (C)
            if (Input.GetKeyDown(KeyCode.C))
            {
                ToggleCrouch();
            }

            // Sprint (Shift)
            isSprinting = Input.GetKey(KeyCode.LeftShift) && !isCrouching && !isAiming;

            // Aim Down Sights (Right Mouse)
            isAiming = Input.GetMouseButton(1);

            // Jump (Space)
            if (Input.GetButtonDown("Jump") && isGrounded && !isCrouching)
            {
                ExecuteJump();
            }

            // Tactical Shout / Voice Callout (T)
            if (Input.GetKeyDown(KeyCode.T))
            {
                TriggerShout("ENEMY SPOTTED AT 210! ENGAGING TARGET!");
            }

            // Quick Medkit Heal (H)
            if (Input.GetKeyDown(KeyCode.H))
            {
                UseMedkit();
            }

            // Throw Frag Grenade (G)
            if (Input.GetKeyDown(KeyCode.G))
            {
                ThrowGrenade();
            }
        }

        public void ExecuteJump()
        {
            if (isGrounded && !isCrouching)
            {
                verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }
        }

        public void ToggleCrouch()
        {
            isCrouching = !isCrouching;
        }

        public void ToggleSprint()
        {
            if (!isCrouching && !isAiming)
            {
                isSprinting = !isSprinting;
            }
        }

        public void TriggerShout(string message)
        {
            OnTacticalShoutTriggered?.Invoke(message);

            // Broadcast voice noise to nearby AI
            Collider[] listeners = Physics.OverlapSphere(transform.position, 40f);
            foreach (var col in listeners)
            {
                var ai = col.GetComponent<AI.EnemyAIController>();
                if (ai != null && ai.gameObject != gameObject)
                {
                    ai.OnHearGunshot(transform.position);
                }
            }
        }

        public void UseMedkit()
        {
            if (healthSystem != null)
            {
                healthSystem.Heal(50f);
            }
        }

        public void ThrowGrenade()
        {
            if (fragGrenadePrefab != null && cameraTransform != null)
            {
                Vector3 spawnPos = grenadeThrowOrigin != null ? grenadeThrowOrigin.position : transform.position + Vector3.up * 1.5f;
                GameObject grenade = Instantiate(fragGrenadePrefab, spawnPos, cameraTransform.rotation);
                Rigidbody rb = grenade.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    Vector3 throwDir = cameraTransform.forward + Vector3.up * 0.2f;
                    rb.velocity = throwDir.normalized * throwForce;
                }
            }
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 direction = new Vector3(horizontal, 0f, vertical).normalized;

            float targetSpeed = walkSpeed;
            if (isAiming) targetSpeed = adsSpeed;
            else if (isCrouching) targetSpeed = crouchSpeed;
            else if (isSprinting && vertical > 0.1f) targetSpeed = sprintSpeed;

            Vector3 moveDirection = Vector3.zero;

            if (direction.magnitude >= 0.1f)
            {
                float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg + cameraTransform.eulerAngles.y;
                
                if (isAiming)
                {
                    transform.rotation = Quaternion.Euler(0f, cameraTransform.eulerAngles.y, 0f);
                }
                else
                {
                    float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
                    transform.rotation = Quaternion.Euler(0f, angle, 0f);
                }

                moveDirection = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
            }
            else if (isAiming)
            {
                transform.rotation = Quaternion.Euler(0f, cameraTransform.eulerAngles.y, 0f);
            }

            verticalVelocity += gravity * Time.deltaTime;
            Vector3 finalMotion = (moveDirection * targetSpeed) + (Vector3.up * verticalVelocity);
            characterController.Move(finalMotion * Time.deltaTime);
        }

        private void HandleCrouchStance()
        {
            float targetHeight = isCrouching ? crouchingHeight : standingHeight;
            Vector3 targetCenter = isCrouching ? crouchingCenter : standingCenter;

            characterController.height = Mathf.Lerp(characterController.height, targetHeight, Time.deltaTime * crouchTransitionSpeed);
            characterController.center = Vector3.Lerp(characterController.center, targetCenter, Time.deltaTime * crouchTransitionSpeed);
        }
    }
}
