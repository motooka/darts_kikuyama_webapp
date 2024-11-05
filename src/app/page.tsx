import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>新規の練習</Link>
      </div>
    </>
  );
}
