import styles from "./Landing.module.css";

interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  return (
    <div className={styles.landing}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          TaskStrand
        </div>
        <h1 className={styles.headline}>Every task, pinned to the thread.</h1>
        <p className={styles.subtitle}>
          Add a task and it joins the strand — one continuous line running through
          everything you have to do, so nothing gets lost between the pins.
        </p>
        <button className={styles.cta} onClick={onStart}>
          Start your thread <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
