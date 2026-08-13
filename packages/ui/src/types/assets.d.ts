// Asset module declarations so @justlife/ui typechecks image imports (Metro + Vite both bundle them).
declare module '*.png' {
  const content: number;
  export default content;
}

declare module '*.webp' {
  const content: number;
  export default content;
}
