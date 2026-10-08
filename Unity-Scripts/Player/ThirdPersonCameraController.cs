using UnityEngine;

namespace ShadowIsland.Player
{
    public class ThirdPersonCameraController : MonoBehaviour
    {
        [Header("Target & Pivot")]
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 defaultPivotOffset = new Vector3(0.6f, 1.6f, 0f); // Right shoulder
        [SerializeField] private Vector3 adsPivotOffset = new Vector3(0.45f, 1.55f, 0.4f);

        [Header("Camera Distance")]
        [SerializeField] private float defaultDistance = 2.8f;
        [SerializeField] private float adsDistance = 1.4f;
        [SerializeField] private float minDistance = 0.5f;

        [Header("Sensitivity & Limits")]
        [SerializeField] private float mouseSensitivity = 2.2f;
        [SerializeField] private float minPitch = -40f;
        [SerializeField] private float maxPitch = 70f;
        [SerializeField] private float smoothSpeed = 15f;

        [Header("Collision Avoidance")]
        [SerializeField] private LayerMask collisionLayers;
        [SerializeField] private float sphereCastRadius = 0.25f;

        [Header("Field of View")]
        [SerializeField] private Camera cam;
        [SerializeField] private float defaultFOV = 65f;
        [SerializeField] private float adsFOV = 45f;
        [SerializeField] private float fovTransitionSpeed = 12f;

        private float currentYaw;
        private float currentPitch;
        private float targetDistance;
        private float currentDistance;
        private Vector3 currentPivotOffset;
        private PlayerController playerController;

        private void Awake()
        {
            if (cam == null) cam = GetComponent<Camera>();
            if (target != null) playerController = target.GetComponent<PlayerController>();

            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;

            currentDistance = defaultDistance;
            currentPivotOffset = defaultPivotOffset;
        }

        private void LateUpdate()
        {
            if (target == null) return;

            HandleInput();
            UpdateCameraTransform();
        }

        private void HandleInput()
        {
            float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

            currentYaw += mouseX;
            currentPitch -= mouseY;
            currentPitch = Mathf.Clamp(currentPitch, minPitch, maxPitch);

            bool isAiming = playerController != null && playerController.IsAiming;

            // Smoothly lerp offsets and FOV
            Vector3 targetOffset = isAiming ? adsPivotOffset : defaultPivotOffset;
            targetDistance = isAiming ? adsDistance : defaultDistance;
            float targetFOV = isAiming ? adsFOV : defaultFOV;

            currentPivotOffset = Vector3.Lerp(currentPivotOffset, targetOffset, Time.deltaTime * smoothSpeed);
            cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, targetFOV, Time.deltaTime * fovTransitionSpeed);
        }

        private void UpdateCameraTransform()
        {
            Quaternion rotation = Quaternion.Euler(currentPitch, currentYaw, 0f);
            Vector3 pivotPosition = target.position + (rotation * currentPivotOffset);

            // Obstacle Raycast/SphereCast to avoid clipping inside walls
            Vector3 desiredCameraPos = pivotPosition - (rotation * Vector3.forward * targetDistance);
            Ray ray = new Ray(pivotPosition, desiredCameraPos - pivotPosition);
            
            float distance = targetDistance;
            if (Physics.SphereCast(ray, sphereCastRadius, out RaycastHit hit, targetDistance, collisionLayers))
            {
                distance = Mathf.Clamp(hit.distance - sphereCastRadius, minDistance, targetDistance);
            }

            currentDistance = Mathf.Lerp(currentDistance, distance, Time.deltaTime * smoothSpeed);
            Vector3 finalPosition = pivotPosition - (rotation * Vector3.forward * currentDistance);

            transform.position = finalPosition;
            transform.rotation = rotation;
        }
    }
}
