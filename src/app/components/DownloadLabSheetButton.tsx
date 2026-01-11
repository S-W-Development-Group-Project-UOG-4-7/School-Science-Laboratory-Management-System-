'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadLabSheetButtonProps {
  practicalId: number;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  /** Optional: Direct filename override. If provided, skips database fetch and uses this filename directly */
  filename?: string;
  /** Optional: Student ID to track who downloaded the lab sheet */
  studentId?: number;
}

/**
 * DownloadLabSheetButton component
 * 
 * Fetches the lab sheet filename from the database for a given practical,
 * then downloads the PDF file directly in the browser.
 */
export function DownloadLabSheetButton({
  practicalId,
  buttonText = 'Download Lab Sheet',
  variant = 'outline',
  size = 'sm',
  className = '',
  filename: directFilename,
  studentId,
}: DownloadLabSheetButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      let actualFilename = '';

      // If direct filename is provided, use it (skip database fetch)
      if (directFilename) {
        actualFilename = directFilename;
      } else {
        // Step 1: Fetch practical data from database to get the lab sheet filename
        const practicalResponse = await fetch(`/api/practicals?id=${practicalId}`);
        
        if (!practicalResponse.ok) {
          throw new Error('Failed to fetch practical data');
        }

        const practicalData = await practicalResponse.json();
        
        if (!practicalData.success || !practicalData.data) {
          throw new Error('Practical not found');
        }

        // The API returns the practical object directly in data when using ?id parameter
        const practical = practicalData.data;
      
        // Get the filename from the database
        let filename = '';
        
        // Option 1: If labSheetUrl exists in database and is not empty or '#'
        if ((practical as any).labSheetUrl && 
            (practical as any).labSheetUrl !== '#' && 
            (practical as any).labSheetUrl.trim() !== '') {
          filename = (practical as any).labSheetUrl;
        }
        // Option 2: Check for labSheetFilename field (alternative field name)
        else if ((practical as any).labSheetFilename && 
                 (practical as any).labSheetFilename !== '#' && 
                 (practical as any).labSheetFilename.trim() !== '') {
          filename = (practical as any).labSheetFilename;
        }
        // Option 3: Map based on practical title (common mappings)
        else if (practical.title) {
          const title = practical.title.toLowerCase();
          
          // Map common practical titles to their PDF filenames
          if (title.includes('acid') && title.includes('base') && title.includes('titration')) {
            filename = 'Grade_11_Acid_Base_Titration_Lab_Sheet.pdf';
          }
          // Add more mappings here as needed
          // else if (title.includes('microscope')) {
          //   filename = 'Grade_9_Microscope_Lab_Sheet.pdf';
          // }
          else {
            // Generate filename from title as fallback
            const titleSlug = practical.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
            filename = `${titleSlug}_lab_sheet.pdf`;
          }
        }
        // Option 4: Default filename (fallback)
        else {
          filename = 'Grade_11_Acid_Base_Titration_Lab_Sheet.pdf';
        }
        
        // If filename is a full URL or path, extract just the filename
        // Remove query parameters and hash fragments too
        actualFilename = filename
          .split('/')
          .pop() // Get last part after /
          ?.split('?')[0] // Remove query parameters
          ?.split('#')[0] // Remove hash fragments
          ?.trim() || filename.trim();
        
        if (!actualFilename || actualFilename === '#' || actualFilename === '') {
          toast.error('Lab sheet filename not found for this practical');
          console.error('Missing filename for practical:', practical);
          return;
        }
        
        // Debug logging (remove in production if needed)
        console.log('Downloading file:', actualFilename);
        console.log('Practical data:', practical);
      }
      
      if (!actualFilename) {
        toast.error('Lab sheet filename not available');
        return;
      }

      // Step 2: Call the download API route with studentId and practicalId for tracking
      let downloadUrl = `/api/download?filename=${encodeURIComponent(actualFilename)}`;
      if (studentId) {
        downloadUrl += `&studentId=${studentId}&practicalId=${practicalId}`;
      }
      
      // Step 3: Download the file directly in the browser
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download file');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = actualFilename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Lab sheet downloaded successfully!');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download lab sheet');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleDownload}
      disabled={isDownloading}
      className={`hover:bg-blue-50 hover:border-blue-300 ${className}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

