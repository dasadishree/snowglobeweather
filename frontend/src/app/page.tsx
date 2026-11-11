import styles from "./page.module.css";

export default function Home() {
  return(
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>SNOWGLOBE</p>
        <p className={styles.date}>11/10/2026</p>
      </header>

      <section className={styles.experience}>
        <div className={styles.location}>
          <p className={styles.eyebrow}>CURRENTLY IN</p>
          <h1>Mineola, NY</h1>
          <p className={styles.condition}>A clear night</p>
        </div>
        
        <div className={styles.globe}>
          <div className={styles.globeGlass}>
            <div className={styles.globeSky}>
              <div className={styles.moon}/>
              <div className={styles.stars}>✦ · ✧ · ✦</div>
            </div>

              <div className={styles.globeLandscape}>
                <div className={styles.mountain}/>
                <div className={styles.snowGround}/>
              </div>
            </div>

            <div className={styles.globeNeck}/>
            <div className={styles.globeBase}>
              <div className={styles.baseHighlight}/>
            </div>
          </div>

          <div className={styles.weather}>
            <p className={styles.temperature}>54°</p>
            <p className={styles.feelsLike}>FEELS LIKE 47°</p>
            <div className={styles.weatherDetails}>
              <div>
                <span>HIGH</span>
                <strong>63°</strong>
              </div>
              <div>
                <span>LOW</span>
                <strong>46°</strong>
              </div>
              <div>
                <span>WIND</span>
                <strong>8 mph</strong>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}