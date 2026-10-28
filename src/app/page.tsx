
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section aria-labelledby="hero-title" className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span aria-hidden="true" className={styles.eyebrowDot} />
              A little joy, served fresh
            </span>
            <h1 id="hero-title">
              Good food,
              <br />
              <span>better days.</span>
            </h1>
            <p className={styles.heroDescription}>
              Find your next feel-good favourite. Fresh, flavourful food that
              makes eating well the easiest part of your day.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#menu">
                Find your flavour <span aria-hidden="true">→</span>
              </a>
              <a className={styles.secondaryButton} href="#how-it-works">
                <span aria-hidden="true" className={styles.playIcon}>▶</span>
                Our little story
              </a>
            </div>
            <div className={styles.socialProof} id="reviews">
              <div aria-hidden="true" className={styles.avatarStack}>
                <span>J</span>
                <span>M</span>
                <span>A</span>
                <span>+</span>
              </div>
              <div>
                <div aria-label="Rated 5 out of 5" className={styles.stars}>★★★★★</div>
                <p>Loved by <strong>2,400+</strong> happy eaters</p>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div aria-hidden="true" className={styles.heroGlow} />
            <div
              aria-label="A colourful fresh salad bowl with avocado, tomatoes and greens"
              className={styles.heroImage}
              role="img"
            />
            <div className={styles.freshBadge}>
              <span aria-hidden="true">✦</span>
              <span><strong>Always fresh</strong><small>Made with love</small></span>
            </div>
            <div className={styles.ratingCard}>
              <span aria-hidden="true" className={styles.ratingIcon}>♡</span>
              <span><strong>4.9 / 5</strong><small>People love this</small></span>
            </div>
            <div aria-hidden="true" className={styles.visualCaption}>
              <span>01</span> GOODNESS IN EVERY BITE
            </div>
          </div>
        </section>

        <section aria-label="Our promise" className={styles.promiseBar} id="how-it-works">
          <div className={styles.promiseItem}>
            <span aria-hidden="true" className={styles.promiseIcon}>✳</span>
            <span><strong>Real ingredients</strong><small>Good things, grown well</small></span>
          </div>
          <span aria-hidden="true" className={styles.promiseDivider} />
          <div className={styles.promiseItem}>
            <span aria-hidden="true" className={styles.promiseIcon}>♡</span>
            <span><strong>Made with care</strong><small>A little love goes a long way</small></span>
          </div>
          <span aria-hidden="true" className={styles.promiseDivider} />
          <div className={styles.promiseItem}>
            <span aria-hidden="true" className={styles.promiseIcon}>⌁</span>
            <span><strong>Good mood food</strong><small>Feel-good flavour, every time</small></span>
          </div>
        </section>

        <section aria-labelledby="menu-title" className={styles.menuSection} id="menu">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>A taste of the good stuff</span>
              <h2 id="menu-title">Fresh picks, <span>just for you.</span></h2>
            </div>
            <a className={styles.textLink} href="#reviews">
              See what people love <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className={styles.foodCards}>
            <article className={styles.foodCard}>
              <div aria-label="Roasted vegetables and greens in a fresh bowl" className={`${styles.foodImage} ${styles.foodImageBowl}`} role="img">
                <span className={styles.foodTag}>FRESH FAVOURITE</span>
                <span aria-hidden="true" className={styles.heartButton}>♡</span>
              </div>
              <div className={styles.foodDetails}>
                <div><h3>The feel-good bowl</h3><p>Bright, fresh & full of goodness</p></div>
                <span className={styles.foodPrice}>$12</span>
              </div>
            </article>
            <article className={styles.foodCard}>
              <div aria-label="Freshly baked flatbread topped with colourful ingredients" className={`${styles.foodImage} ${styles.foodImageFlatbread}`} role="img">
                <span className={styles.foodTag}>A LITTLE BIT OF JOY</span>
                <span aria-hidden="true" className={styles.heartButton}>♡</span>
              </div>
              <div className={styles.foodDetails}>
                <div><h3>Garden party flatbread</h3><p>Warm, herby & made to share</p></div>
                <span className={styles.foodPrice}>$14</span>
              </div>
            </article>
            <article className={styles.foodCard}>
              <div aria-label="Fresh berry and yoghurt breakfast bowl" className={`${styles.foodImage} ${styles.foodImageBreakfast}`} role="img">
                <span className={styles.foodTag}>MORNING MAGIC</span>
                <span aria-hidden="true" className={styles.heartButton}>♡</span>
              </div>
              <div className={styles.foodDetails}>
                <div><h3>Berry bright breakfast</h3><p>Sweet starts, naturally</p></div>
                <span className={styles.foodPrice}>$9</span>
              </div>
            </article>
          </div>
        </section>

        <footer className={styles.footer}>
          <a aria-label="ChopLingo home" className={styles.brand} href="#">
            <span aria-hidden="true" className={styles.brandMark}>
              <svg viewBox="0 0 32 32">
                <path d="M5 17h22c-.7 6.1-4.9 10-11 10S5.7 23.1 5 17Z" />
                <path d="M8 13.5c1.7-1.6 3.4-1.6 5.1 0m3.3 0c1.7-1.6 3.4-1.6 5.1 0M16 8V5m-4 4-2-2m10 2 2-2" />
              </svg>
            </span>
            <span>chop<span className={styles.brandAccent}>lingo</span></span>
          </a>
          <p>Made for good days and really good food.</p>
          <span>© 2026 ChopLingo</span>
        </footer>
      </div>
    </main>
  );
}
