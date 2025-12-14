'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import PracticalCard from './pracicalcard';
import { Practical, FilterState } from '@/types/practical';
import styles from './practicals.module.css';

// Mock data
const practicalsData: Practical[] = [
  {
    id: '1',
    subject: 'Chemistry',
    grade: '11',
    title: 'Acid-Base Titration',
    description: 'Learn the proper technique for conducting acid-base titrations using standard solutions.',
    difficulty: 'Intermediate',
    duration: '45 min',
    thumbnail: '/images/chemistry-titration.jpg'
  },
  {
    id: '2',
    subject: 'Biology',
    grade: '9',
    title: 'Microscope Usage and Cell Observation',
    description: 'Introduction to compound microscope operation and observing plant and animal cells.',
    difficulty: 'Beginner',
    duration: '30 min',
    thumbnail: '/images/microscope.jpg'
  },
  {
    id: '3',
    subject: 'Physics',
    grade: '10',
    title: 'Ohm\'s Law Verification',
    description: 'Verify Ohm\'s Law by measuring current and voltage across resistors.',
    difficulty: 'Intermediate',
    duration: '60 min',
    thumbnail: '/images/physics-circuit.jpg'
  },
  {
    id: '4',
    subject: 'Chemistry',
    grade: '12',
    title: 'Chemical Kinetics',
    description: 'Study the rate of chemical reactions and factors affecting them.',
    difficulty: 'Advanced',
    duration: '90 min',
    thumbnail: '/images/chemistry-kinetics.jpg'
  },
  {
    id: '5',
    subject: 'Biology',
    grade: '11',
    title: 'DNA Extraction',
    description: 'Extract DNA from plant cells using basic laboratory techniques.',
    difficulty: 'Intermediate',
    duration: '50 min',
    thumbnail: '/images/dna-extraction.jpg'
  },
  {
    id: '6',
    subject: 'Physics',
    grade: '12',
    title: 'Optics: Lens Properties',
    description: 'Determine focal length and magnification properties of convex lenses.',
    difficulty: 'Advanced',
    duration: '75 min',
    thumbnail: '/images/optics.jpg'
  }
];

const subjects = ['All Subjects', 'Chemistry', 'Biology', 'Physics', 'Environmental Science'];
const grades = ['All Grades', '9', '10', '11', '12'];

export default function PracticalsPage() {
  const [filters, setFilters] = useState<FilterState>({
    subject: 'All Subjects',
    grade: 'All Grades',
    search: ''
  });

  // Filter practicals based on current filters
  const filteredPracticals = practicalsData.filter(practical => {
    const matchesSearch = practical.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         practical.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSubject = filters.subject === 'All Subjects' || practical.subject === filters.subject;
    const matchesGrade = filters.grade === 'All Grades' || practical.grade === filters.grade;

    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handleAddPractical = () => {
    console.log('Add practical clicked');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Practical Videos & Lab Sheets</h1>
            <p className={styles.pageDescription}>
              Access video demonstrations and downloadable lab sheets for your science practicals
            </p>
          </div>
          <button className={styles.addButtonHeader} onClick={handleAddPractical}>
            <Plus size={20} />
            Add Practical
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersWrapper}>
          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search practicals..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={styles.searchInput}
            />
          </div>

          {/* Subject Filter */}
          <div className={styles.filterGroup}>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              className={styles.filterSelect}
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsSection}>
        <p className={styles.resultsCount}>
          Showing {filteredPracticals.length} practicals
        </p>
      </div>

      {/* Practicals Grid */}
      <div className={styles.practicalsGrid}>
        {filteredPracticals.map((practical) => (
          <PracticalCard key={practical.id} practical={practical} />
        ))}
      </div>

      {/* No Results */}
      {filteredPracticals.length === 0 && (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>
            <Search size={64} strokeWidth={1.5} />
          </div>
          <h3 className={styles.noResultsTitle}>No practicals found</h3>
          <p className={styles.noResultsText}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}