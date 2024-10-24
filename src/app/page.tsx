'use client'
// import { useState } from "react";
// import Player from "../../components/player";
import UnifiedInputDropzone from "../../components/file-input";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <UnifiedInputDropzone></UnifiedInputDropzone>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        eventually a footer
      </footer>
    </div>
  );
}
