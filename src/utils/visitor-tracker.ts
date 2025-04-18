import { Request } from 'express';
import Link from '@/models/link.model';

/**
 * Utility to track link visits
 */
export const trackVisit = async (linkId: string, req: Request): Promise<void> => {
  try {
    // Get the link
    const link = await Link.findById(linkId);
    if (!link) return;

    // Extract visitor information
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Add visitor to link
    link.visitors.push({
      ip: ip.toString(),
      userAgent,
      timestamp: new Date()
    });

    // Increment open count
    link.openCount += 1;
    
    // Save link
    await link.save();
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

/**
 * Get visitor statistics for a link
 */
export const getVisitorStats = (link: any) => {
  if (!link || !link.visitors) {
    return {
      openCount: 0,
      uniqueVisitors: 0,
      visitorCount: 0,
      recentVisitors: []
    };
  }

  return {
    openCount: link.openCount,
    uniqueVisitors: new Set(link.visitors.map((v: any) => v.ip)).size,
    visitorCount: link.visitors.length,
    recentVisitors: link.visitors.slice(-10).reverse(), // Get last 10 visitors, most recent first
    // Group visitors by date
    visitsByDate: link.visitors.reduce((acc: any, visitor: any) => {
      const date = new Date(visitor.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {})
  };
};

export default {
  trackVisit,
  getVisitorStats
};