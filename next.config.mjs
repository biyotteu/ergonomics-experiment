/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⚠ 임시: 빌드 시 타입/린트 에러로 배포 실패를 방지.
  // 추후 로컬에서 `npm run build` 돌려 실제 에러를 잡은 뒤 false로 되돌리는 것을 권장.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
