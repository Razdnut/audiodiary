import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { Color } from "three";
import type { Mesh, PlaneGeometry, ShaderMaterial } from "three";

type SilkUniforms = {
  uSpeed: { value: number };
  uScale: { value: number };
  uNoiseIntensity: { value: number };
  uColor: { value: Color };
  uRotation: { value: number };
  uTime: { value: number };
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh<PlaneGeometry, ShaderMaterial>, SilkPlaneProps>(({ uniforms }, ref) => {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    if (ref && "current" in ref && ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [viewport, ref]);

  useFrame((_, delta) => {
    if (ref && "current" in ref && ref.current) {
      ref.current.material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const Silk = ({ speed = 5, scale = 1, color = "#FF295E", noiseIntensity = 1.5, rotation = 0 }: SilkProps) => {
  const meshRef = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null);
  const uniformsRef = useRef<SilkUniforms>({
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(color) },
    uRotation: { value: rotation },
    uTime: { value: 0 },
  });

  useEffect(() => {
    uniformsRef.current.uSpeed.value = speed;
    uniformsRef.current.uScale.value = scale;
    uniformsRef.current.uNoiseIntensity.value = noiseIntensity;
    uniformsRef.current.uColor.value.set(color);
    uniformsRef.current.uRotation.value = rotation;
  }, [color, noiseIntensity, rotation, scale, speed]);

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="always"
      gl={{ alpha: true }}
      className="h-full w-full"
      style={{ background: "transparent" }}
    >
      <SilkPlane ref={meshRef} uniforms={uniformsRef.current} />
    </Canvas>
  );
};

const SilkBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10">
    <Silk color="#FF295E" />
  </div>
);

export default SilkBackground;
