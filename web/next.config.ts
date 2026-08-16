import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * 주 사용 환경이 모바일이라 개발 중에도 핸드폰으로 자주 열어 본다.
   * 그런데 next dev는 localhost가 아닌 주소에서 오는 JS 요청을 기본으로 막아서,
   * 핸드폰에서는 화면만 보이고 버튼이 하나도 안 눌리는 상태가 된다.
   * 아래는 같은 와이파이의 사설 IP(192.168.x.x)를 허용하는 설정이다.
   *
   * 개발 서버에만 적용되고 배포(Vercel)와는 무관하다.
   * 공유기가 바뀌면 IP가 달라진다. next dev가 켜질 때 찍어 주는
   * "Network: http://___:3000" 주소를 보고 여기에 추가할 것.
   */
  allowedDevOrigins: ["192.168.45.15", "192.168.*.*", "172.30.*.*", "10.*.*.*"],
};

export default nextConfig;
