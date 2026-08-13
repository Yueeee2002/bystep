declare module 'sharp' {
  function sharp(input: Buffer): {
    rotate(): {
      jpeg(opts: { quality: number; mozjpeg?: boolean }): { toBuffer(): Promise<Buffer> }
      webp(opts: { quality: number }): { toBuffer(): Promise<Buffer> }
    }
  }
  export default sharp
}
