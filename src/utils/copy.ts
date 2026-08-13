export const TAG_EMPTY_HINTS = [
  '给旅途，归置几枚温柔标签',
  '空白标签栏，等待收纳心动去处',
  '先定好分类，再奔赴每一场探店',
  '为目的地，贴上专属小记号',
]

export const GREETINGS = [
  'Where to wander today?',
  'Slow down and explore.',
  'Chase tiny city joys.',
  'Pause for lovely spots.',
  'Little adventures.',
]

export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] ?? list[0]
}

export function composeGreeting(nickname: string, line: string): string {
  const name = nickname.trim()
  return name ? `${name} · ${line}` : line
}
