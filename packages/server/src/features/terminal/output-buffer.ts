export class OutputBuffer {
  private chunks: string[] = [];
  private totalBytes = 0;

  constructor(private readonly maxBytes: number = 50 * 1024) {}

  append(data: string): void {
    this.chunks.push(data);
    this.totalBytes += data.length;

    while (this.chunks.length > 1 && this.totalBytes > this.maxBytes) {
      const evicted = this.chunks.shift()!;
      this.totalBytes -= evicted.length;
    }
  }

  getContents(): string {
    return this.chunks.join('');
  }

  clear(): void {
    this.chunks = [];
    this.totalBytes = 0;
  }

  get size(): number {
    return this.totalBytes;
  }
}
