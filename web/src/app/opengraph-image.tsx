import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * 카톡·슬랙 등에 링크를 붙여넣을 때 뜨는 미리보기 이미지.
 * 빌드할 때 한 번 만들어져 정적 파일로 배포된다.
 *
 * ⚠️ 이미지 생성기(Satori)의 기본 폰트에는 한글 글리프가 없다.
 *    폰트를 안 주면 한글이 전부 빈 네모로 나온다.
 *    그래서 assets/og-font.ttf를 직접 읽어 넘긴다.
 *
 *    이 폰트는 Noto Sans KR을 **이 이미지에 쓰는 글자만 남기고 잘라낸** 것이라 4.8KB다.
 *    문구를 바꾸려면 폰트도 다시 받아야 한다. 없는 글자는 빈칸으로 나온다.
 *    (Google Fonts css2 API의 text= 파라미터로 필요한 글자만 받을 수 있다)
 */

export const alt = "우리 뭐 먹지? — 먹기 싫은 걸 지우면 메뉴가 정해집니다";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = await readFile(join(process.cwd(), "assets/og-font.ttf"));

// 앞의 다섯은 지워진 것처럼, 마지막 하나만 살아남은 것처럼 보여준다.
// "고르는 서비스"가 아니라 "지우는 서비스"임을 이미지 한 장으로 전달하기 위해서다
const REMOVED = ["🍚", "🥟", "🍣", "🍝", "🍔"];
const SURVIVOR = "🍲";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // DESIGN.md의 크림 캔버스와 같은 값
          backgroundColor: "#F5F1EA",
          fontFamily: "Noto Sans KR",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {REMOVED.map((emoji) => (
            <span key={emoji} style={{ fontSize: 72, opacity: 0.22 }}>
              {emoji}
            </span>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 132,
              height: 132,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              border: "6px solid #C24E12",
            }}
          >
            <span style={{ fontSize: 76 }}>{SURVIVOR}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 104,
            color: "#241D18",
            marginTop: 56,
            letterSpacing: -2,
          }}
        >
          우리 뭐 먹지?
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#A8410D",
            marginTop: 20,
          }}
        >
          먹기 싫은 걸 지우면 메뉴가 정해집니다
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
