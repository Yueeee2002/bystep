import styles from './TabArt.module.css'

interface TabArtProps {
  src: string
}

/** 首页 Tab 底层装饰照片：不占布局、不可点、始终只渲染一张。 */
export default function TabArt({ src }: TabArtProps) {
  return (
    <div className={styles.layer} aria-hidden="true">
      <span className={styles.dots} />
      <img className={styles.illustrationBg} src={src} alt="" draggable={false} />
    </div>
  )
}
