import { Clock, Play, FileText, Download } from 'lucide-react';
import { Practical } from '@/types/practical';
import styles from './practicalcard.module.css';

interface PracticalCardProps {
  practical: Practical;
}

export default function PracticalCard({ practical }: PracticalCardProps) {
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return styles.difficultyBeginner;
      case 'Intermediate':
        return styles.difficultyIntermediate;
      case 'Advanced':
        return styles.difficultyAdvanced;
      default:
        return '';
    }
  };

  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        <img 
          src={practical.thumbnail || '/images/default-practical.jpg'} 
          alt={practical.title}
          className={styles.thumbnailImage}
        />
        <div className={styles.thumbnailOverlay}>
          <div className={styles.playButton}>
            <Play size={24} fill="white" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        {/* Tags */}
        <div className={styles.cardHeader}>
          <div className={styles.tags}>
            <span className={styles.subjectTag}>{practical.subject}</span>
            <span className={styles.gradeTag}>Grade {practical.grade}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{practical.title}</h3>

        {/* Description */}
        <p className={styles.description}>{practical.description}</p>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <div className={styles.metadata}>
            <span className={`${styles.difficultyTag} ${getDifficultyClass(practical.difficulty)}`}>
              {practical.difficulty}
            </span>
            <div className={styles.duration}>
              <Clock size={16} />
              <span>{practical.duration}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.watchButton}`}>
              <Play size={16} />
              Watch Video
            </button>
            <button className={`${styles.button} ${styles.labSheetButton}`}>
              <FileText size={16} />
              Lab Sheet
            </button>
            <button className={`${styles.button} ${styles.downloadButton}`}>
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}