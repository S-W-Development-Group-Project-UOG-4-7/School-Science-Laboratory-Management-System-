'use client';

import { Search, Plus } from 'lucide-react';
import { FilterState } from '@/types/practical';
import styles from './practicalfilters.module.css';

interface PracticalFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  subjects: string[];
  grades: string[];
  onAddPractical?: () => void;
}

export default function PracticalFilters({ 
  filters, 
  onFilterChange, 
  subjects, 
  grades,
  onAddPractical
}: PracticalFiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search practicals..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />
      </div>

      {/* Subject Filter */}
      <div className={styles.filterGroup}>
        <select
          value={filters.subject}
          onChange={(e) => onFilterChange({ ...filters, subject: e.target.value })}
          className={styles.filterSelect}
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Grade Filter */}
      <div className={styles.filterGroup}>
        <select
          value={filters.grade}
          onChange={(e) => onFilterChange({ ...filters, grade: e.target.value })}
          className={styles.filterSelect}
        >
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      {/* Add Practical Button */}
      {onAddPractical && (
        <button className={styles.addButton} onClick={onAddPractical}>
          <Plus size={20} />
          Add Practical
        </button>
      )}
    </div>
  );
}