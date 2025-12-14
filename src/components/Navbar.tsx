"use client";

import Link from "next/link";
import { Beaker, Video, FileSearch, Calendar, Package, User } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <Beaker size={20} color="#2563eb" />
          </div>
          <Link href="/" className={styles.logoText}>
            Science Lab Portal
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link href="/practicals" className={styles.navLink}>
            <Video className={styles.navIcon} />
            Practicals & Videos
          </Link>

          <Link href="/laboratory" className={styles.navLink}>
            <FileSearch className={styles.navIcon} />
            Laboratory Inventory
          </Link>

          <Link href="/schedule" className={styles.navLink}>
            <Calendar className={styles.navIcon} />
            Schedule & Calendar
          </Link>

          <Link href="/inventory" className={styles.navLink}>
            <Package className={styles.navIcon} />
            Inventory Requests
          </Link>
        </div>

        {/* User Profile */}
        <div className={styles.authButtons}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <span>M</span>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Mr. Perera</span>
              <span className={styles.userRole}>Teacher</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}