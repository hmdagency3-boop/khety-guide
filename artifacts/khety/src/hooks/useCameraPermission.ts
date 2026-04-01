import { useState, useEffect, useCallback } from "react";

export type CameraPermState = "unknown" | "granted" | "denied" | "prompt";

export function useCameraPermission() {
  const [state, setState] = useState<CameraPermState>("unknown");

  useEffect(() => {
    if (!navigator.permissions) {
      setState("prompt");
      return;
    }
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((result) => {
        setState(result.state as CameraPermState);
        result.onchange = () => setState(result.state as CameraPermState);
      })
      .catch(() => setState("prompt"));
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      setState("granted");
      return true;
    } catch {
      setState("denied");
      return false;
    }
  }, []);

  return { state, request };
}
