import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface CombatViewProps {
  isActive: boolean;
  attacker: any;
  defender: any;
  onExitCombat: () => void;
  onCombatAction: (action: string) => void;
}

interface Camera {
  x: number;
  y: number;
  z: number;
  angleX: number;
  angleY: number;
  mode: "first" | "third";
}

interface Soldier {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: string;
  isPlayerUnit: boolean;
  facing: number;
  animationFrame: number;
  action: "idle" | "walking" | "attacking" | "defending";
}

interface TerrainFeature {
  type: "tree" | "rock" | "building" | "wall" | "tower";
  x: number;
  y: number;
  z: number;
  size: number;
}

export function CombatView({
  isActive,
  attacker,
  defender,
  onExitCombat,
  onCombatAction,
}: CombatViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 5,
    z: -10,
    angleX: 0,
    angleY: 0,
    mode: "third",
  });

  const [soldiers, setSoldiers] = useState<Soldier[]>([
    {
      id: "player1",
      x: -2,
      y: 0,
      z: 0,
      health: attacker?.health || 100,
      maxHealth: attacker?.maxHealth || 100,
      type: attacker?.type || "legionnaire",
      isPlayerUnit: true,
      facing: 0,
      animationFrame: 0,
      action: "idle",
    },
    {
      id: "enemy1",
      x: 2,
      y: 0,
      z: 0,
      health: defender?.health || 100,
      maxHealth: defender?.maxHealth || 100,
      type: defender?.type || "hastati",
      isPlayerUnit: false,
      facing: Math.PI,
      animationFrame: 0,
      action: "idle",
    },
  ]);

  const [terrain] = useState<TerrainFeature[]>([
    { type: "tree", x: -5, y: 0, z: 3, size: 1.5 },
    { type: "tree", x: 4, y: 0, z: -2, size: 1.2 },
    { type: "rock", x: 0, y: 0, z: 5, size: 0.8 },
    { type: "building", x: -8, y: 0, z: -5, size: 2 },
    { type: "wall", x: 6, y: 0, z: 4, size: 1 },
    { type: "tower", x: -3, y: 0, z: -8, size: 2.5 },
  ]);

  const [keys, setKeys] = useState<Set<string>>(new Set());

  const toggleCameraMode = () => {
    setCamera((prev) => ({
      ...prev,
      mode: prev.mode === "first" ? "third" : "first",
      y: prev.mode === "first" ? 5 : 1.7,
      z: prev.mode === "first" ? -10 : -2,
    }));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (e.key.toLowerCase() === "f") {
      toggleCameraMode();
    } else {
      setKeys((prev) => new Set(prev).add(e.key.toLowerCase()));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(e.key.toLowerCase());
      return newKeys;
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [isActive, handleKeyDown, handleKeyUp]);

  const updateCamera = () => {
    if (keys.size === 0) return;

    setCamera((prevCamera) => {
      const speed = 0.1;
      const rotSpeed = 0.02;
      const newCamera = { ...prevCamera };

      if (keys.has("w")) newCamera.z += speed;
      if (keys.has("s")) newCamera.z -= speed;
      if (keys.has("a")) newCamera.x -= speed;
      if (keys.has("d")) newCamera.x += speed;
      if (keys.has("q")) newCamera.y += speed;
      if (keys.has("e")) newCamera.y -= speed;

      if (keys.has("arrowleft")) newCamera.angleY -= rotSpeed;
      if (keys.has("arrowright")) newCamera.angleY += rotSpeed;
      if (keys.has("arrowup")) newCamera.angleX -= rotSpeed;
      if (keys.has("arrowdown")) newCamera.angleX += rotSpeed;

      return newCamera;
    });
  };

  const drawPixelSoldier = (
    ctx: CanvasRenderingContext2D,
    soldier: Soldier,
    screenX: number,
    screenY: number,
    scale: number,
  ) => {
    const pixelSize = Math.max(1, scale * 0.5);
    const colors = {
      legionnaire: {
        armor: "#8B4513",
        tunic: "#DC143C",
        skin: "#DDBEA9",
      },
      hastati: {
        armor: "#4682B4",
        tunic: "#000080",
        skin: "#DDBEA9",
      },
      triarii: {
        armor: "#800080",
        tunic: "#4B0082",
        skin: "#DDBEA9",
      },
      archer: {
        armor: "#228B22",
        tunic: "#006400",
        skin: "#DDBEA9",
      },
    };

    const color =
      colors[soldier.type as keyof typeof colors] ||
      colors.legionnaire;

    // Draw pixelated soldier
    const bodyHeight = 16 * pixelSize;
    const bodyWidth = 8 * pixelSize;

    // Body (tunic)
    ctx.fillStyle = color.tunic;
    ctx.fillRect(
      screenX - bodyWidth / 2,
      screenY - bodyHeight + 4 * pixelSize,
      bodyWidth,
      8 * pixelSize,
    );

    // Armor/chest
    ctx.fillStyle = color.armor;
    ctx.fillRect(
      screenX - bodyWidth / 2 + pixelSize,
      screenY - bodyHeight + 5 * pixelSize,
      bodyWidth - 2 * pixelSize,
      4 * pixelSize,
    );

    // Head
    ctx.fillStyle = color.skin;
    ctx.fillRect(
      screenX - 3 * pixelSize,
      screenY - bodyHeight,
      6 * pixelSize,
      6 * pixelSize,
    );

    // Helmet
    ctx.fillStyle = color.armor;
    ctx.fillRect(
      screenX - 4 * pixelSize,
      screenY - bodyHeight,
      8 * pixelSize,
      3 * pixelSize,
    );

    // Legs
    ctx.fillStyle = color.skin;
    ctx.fillRect(
      screenX - 3 * pixelSize,
      screenY - 4 * pixelSize,
      2 * pixelSize,
      4 * pixelSize,
    );
    ctx.fillRect(
      screenX + pixelSize,
      screenY - 4 * pixelSize,
      2 * pixelSize,
      4 * pixelSize,
    );

    // Weapon (sword/spear)
    ctx.fillStyle = "#C0C0C0";
    if (soldier.type === "archer") {
      // Bow
      ctx.fillRect(
        screenX + 4 * pixelSize,
        screenY - 12 * pixelSize,
        pixelSize,
        8 * pixelSize,
      );
    } else {
      // Sword
      ctx.fillRect(
        screenX + 4 * pixelSize,
        screenY - 8 * pixelSize,
        pixelSize,
        6 * pixelSize,
      );
    }

    // Shield
    if (soldier.type !== "archer") {
      ctx.fillStyle = soldier.isPlayerUnit
        ? "#DC143C"
        : "#8B4513";
      ctx.fillRect(
        screenX - 6 * pixelSize,
        screenY - 10 * pixelSize,
        2 * pixelSize,
        6 * pixelSize,
      );
    }

    // Health bar
    const healthBarWidth = bodyWidth;
    const healthBarHeight = 2 * pixelSize;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - bodyHeight - 4 * pixelSize,
      healthBarWidth,
      healthBarHeight,
    );

    const healthPercent = soldier.health / soldier.maxHealth;
    ctx.fillStyle =
      healthPercent > 0.6
        ? "#10b981"
        : healthPercent > 0.3
          ? "#f59e0b"
          : "#ef4444";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - bodyHeight - 4 * pixelSize,
      healthBarWidth * healthPercent,
      healthBarHeight,
    );
  };

  const drawTerrain = (
    ctx: CanvasRenderingContext2D,
    feature: TerrainFeature,
    screenX: number,
    screenY: number,
    scale: number,
  ) => {
    const pixelSize = Math.max(1, scale * 0.3);

    switch (feature.type) {
      case "tree":
        // Tree trunk
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(
          screenX - 2 * pixelSize,
          screenY,
          4 * pixelSize,
          -12 * pixelSize * feature.size,
        );

        // Tree foliage
        ctx.fillStyle = "#228B22";
        const foliageSize = 8 * pixelSize * feature.size;
        ctx.fillRect(
          screenX - foliageSize / 2,
          screenY - 15 * pixelSize * feature.size,
          foliageSize,
          foliageSize,
        );
        break;

      case "rock":
        ctx.fillStyle = "#708090";
        const rockSize = 6 * pixelSize * feature.size;
        ctx.fillRect(
          screenX - rockSize / 2,
          screenY - rockSize / 2,
          rockSize,
          rockSize / 2,
        );
        break;

      case "building":
        const buildingWidth = 16 * pixelSize * feature.size;
        const buildingHeight = 20 * pixelSize * feature.size;

        // Walls
        ctx.fillStyle = "#D2691E";
        ctx.fillRect(
          screenX - buildingWidth / 2,
          screenY - buildingHeight,
          buildingWidth,
          buildingHeight,
        );

        // Roof
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(
          screenX - buildingWidth / 2 - 2 * pixelSize,
          screenY - buildingHeight - 4 * pixelSize,
          buildingWidth + 4 * pixelSize,
          4 * pixelSize,
        );
        break;

      case "wall":
        ctx.fillStyle = "#696969";
        ctx.fillRect(
          screenX - 8 * pixelSize,
          screenY - 8 * pixelSize * feature.size,
          16 * pixelSize,
          8 * pixelSize * feature.size,
        );
        break;

      case "tower":
        const towerWidth = 12 * pixelSize * feature.size;
        const towerHeight = 30 * pixelSize * feature.size;

        // Tower base
        ctx.fillStyle = "#2F4F4F";
        ctx.fillRect(
          screenX - towerWidth / 2,
          screenY - towerHeight,
          towerWidth,
          towerHeight,
        );

        // Tower top
        ctx.fillStyle = "#708090";
        ctx.fillRect(
          screenX - towerWidth / 2 - 2 * pixelSize,
          screenY - towerHeight - 4 * pixelSize,
          towerWidth + 4 * pixelSize,
          6 * pixelSize,
        );
        break;
    }
  };

  const project3D = (
    x: number,
    y: number,
    z: number,
    currentCamera: Camera,
    canvas: HTMLCanvasElement,
  ) => {
    // Simple 3D to 2D projection
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const fov = 500;

    // Apply camera rotation
    const cosY = Math.cos(currentCamera.angleY);
    const sinY = Math.sin(currentCamera.angleY);
    const cosX = Math.cos(currentCamera.angleX);
    const sinX = Math.sin(currentCamera.angleX);

    // Translate relative to camera
    let relX = x - currentCamera.x;
    let relY = y - currentCamera.y;
    let relZ = z - currentCamera.z;

    // Rotate around Y axis
    const rotX = relX * cosY - relZ * sinY;
    const rotZ = relX * sinY + relZ * cosY;

    // Rotate around X axis
    const finalY = relY * cosX - rotZ * sinX;
    const finalZ = relY * sinX + rotZ * cosX;

    if (finalZ <= 0) return null; // Behind camera

    const screenX = cx + (rotX * fov) / finalZ;
    const screenY = cy - (finalY * fov) / finalZ;
    const scale = fov / finalZ;

    return { screenX, screenY, scale, distance: finalZ };
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with sky color
    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height,
    );
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(0.7, "#DEB887");
    gradient.addColorStop(1, "#8FBC8F");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "#8FBC8F";
    ctx.fillRect(
      0,
      canvas.height * 0.7,
      canvas.width,
      canvas.height * 0.3,
    );

    // Collect all 3D objects for depth sorting
    const objects: Array<{
      type: "soldier" | "terrain";
      data: any;
      projected: any;
    }> = [];

    // Project soldiers
    soldiers.forEach((soldier) => {
      const projected = project3D(
        soldier.x,
        soldier.y,
        soldier.z,
        camera,
        canvas,
      );
      if (projected) {
        objects.push({
          type: "soldier",
          data: soldier,
          projected,
        });
      }
    });

    // Project terrain
    terrain.forEach((feature) => {
      const projected = project3D(
        feature.x,
        feature.y,
        feature.z,
        camera,
        canvas,
      );
      if (projected) {
        objects.push({
          type: "terrain",
          data: feature,
          projected,
        });
      }
    });

    // Sort by distance (far to near)
    objects.sort(
      (a, b) => b.projected.distance - a.projected.distance,
    );

    // Draw objects in correct order
    objects.forEach((obj) => {
      const { screenX, screenY, scale } = obj.projected;

      if (obj.type === "soldier") {
        drawPixelSoldier(
          ctx,
          obj.data,
          screenX,
          screenY,
          scale,
        );
      } else if (obj.type === "terrain") {
        drawTerrain(ctx, obj.data, screenX, screenY, scale);
      }
    });
  };

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      updateCamera();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]); // Only depend on isActive

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="w-full h-full object-contain bg-gradient-to-b from-blue-400 to-green-400"
      />

      {/* Combat HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <Card className="bg-black/70 text-white border-amber-600">
          <CardContent className="p-4">
            <div className="text-lg font-bold mb-2">
              Combat Engagement
            </div>
            <div className="space-y-1 text-sm">
              <div>
                Camera:{" "}
                {camera.mode === "first"
                  ? "First Person"
                  : "Third Person"}
              </div>
              <div>
                Position: ({camera.x.toFixed(1)},{" "}
                {camera.y.toFixed(1)}, {camera.z.toFixed(1)})
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleCameraMode}
            className="bg-black/70 text-white border-amber-600 hover:bg-amber-600"
          >
            📷{" "}
            {camera.mode === "first"
              ? "Third Person"
              : "First Person"}
          </Button>
          <Button
            onClick={onExitCombat}
            className="bg-red-600 hover:bg-red-700"
          >
            ↩️ Exit Combat
          </Button>
        </div>
      </div>

      {/* Unit Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-4">
          {soldiers.map((soldier) => (
            <Card
              key={soldier.id}
              className={`bg-black/70 text-white border-2 ${soldier.isPlayerUnit ? "border-blue-400" : "border-red-400"}`}
            >
              <CardContent className="p-2 text-center">
                <Badge
                  className={
                    soldier.isPlayerUnit
                      ? "bg-blue-600"
                      : "bg-red-600"
                  }
                >
                  {soldier.type}
                </Badge>
                <div className="text-sm mt-1">
                  HP: {soldier.health}/{soldier.maxHealth}
                </div>
                <div className="w-16 h-2 bg-gray-600 rounded mt-1">
                  <div
                    className={`h-full rounded ${soldier.health > soldier.maxHealth * 0.6 ? "bg-green-500" : soldier.health > soldier.maxHealth * 0.3 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{
                      width: `${(soldier.health / soldier.maxHealth) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Combat Actions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          <Button
            onClick={() => onCombatAction("attack")}
            className="bg-red-600 hover:bg-red-700"
          >
            ⚔️ Attack
          </Button>
          <Button
            onClick={() => onCombatAction("defend")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🛡️ Defend
          </Button>
          <Button
            onClick={() => onCombatAction("special")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ✨ Special
          </Button>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4">
        <Card className="bg-black/70 text-white border-amber-600">
          <CardContent className="p-3 text-xs">
            <div className="font-bold mb-1">Controls:</div>
            <div>WASD - Move Camera</div>
            <div>QE - Up/Down</div>
            <div>Arrow Keys - Look</div>
            <div>F - Toggle Camera Mode</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}