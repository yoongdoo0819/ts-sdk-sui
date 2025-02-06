import fs from 'fs/promises';

const NETWORK = "devnet";

// Move 파일 읽기 및 Move.toml 생성 함수
async function generateMoveToml() {
    try {
        // example.move 파일 읽기
        const moveCode = await fs.readFile('./sui/sources/test.move', 'utf-8');

        // 첫 줄에서 모듈 이름 추출
        const moduleLine = moveCode.split("\n")[0]; // 첫 번째 줄 가져오기
        const moduleNameMatch = moduleLine.match(/module (\w+)::/); // 정규식으로 모듈 이름 찾기

        if (!moduleNameMatch) throw new Error("모듈 이름을 찾을 수 없습니다.");

        const moduleName = moduleNameMatch[1]; // 모듈 이름 (예: "ptb_test")

        // Move.toml 템플릿 생성
        const moveTomlContent = `[package]
name = "${moduleName}"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/${NETWORK}" }

[addresses]
${moduleName} = "0x0"
        `;

        // Move.toml 파일로 저장
        await fs.writeFile('./sui/Move.toml', moveTomlContent, 'utf-8');

        console.log("Move.toml 파일이 성공적으로 생성되었습니다.");
    } catch (error) {
        console.error("오류 발생:", error.message);
    }
}

// 실행
generateMoveToml();
