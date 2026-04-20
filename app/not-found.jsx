import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <section className="bg-white text-black">
      <div className="mx-auto max-w-5xl px-4 py-60 text-center sm:px-6 lg:px-8">
        <div className={styles.cardWrap} aria-hidden="true">
          <div className={styles.holo}>
            <div className={`${styles.layer} ${styles.front}`}>4</div>
            <div className={`${styles.layer} ${styles.mid}`}>0</div>
            <div className={`${styles.layer} ${styles.back}`}>4</div>

          </div>
        </div>

        <h1 className="text-3xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-4 text-black">
          Liên kết bạn truy cập không tồn tại hoặc đã được cập nhật.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border bg-black border-white/20 px-6 py-3 text-sm text-white transition hover:bg-purple-400 hover:border-purple-400"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </section>
  );
}