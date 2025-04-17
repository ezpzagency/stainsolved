import { useEffect, RefObject } from "react";

/**
 * Animation Utilities
 * 
 * This file provides utilities for UI animations that replaced Anime.js.
 * The approach now focuses on declarative animations with React hooks
 * rather than imperative animations with Anime.js.
 * 
 * Key changes in animation strategy:
 * 1. Moved from global timelines to component-scoped animations
 * 2. Leverages browser APIs like Intersection Observer for scroll-based triggers
 * 3. Better integration with React's component lifecycle
 * 4. Improved performance by only animating elements in viewport
 */

interface IntersectionObserverOptions {
  ref: RefObject<HTMLElement>;
  onIntersect: (entries: IntersectionObserverEntry[]) => void;
  threshold?: number | number[];
  rootMargin?: string;
  targetSelector?: string;
}

export const useIntersectionObserver = ({
  ref,
  onIntersect,
  threshold = 0,
  rootMargin = "0px",
  targetSelector
}: IntersectionObserverOptions) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      onIntersect,
      {
        threshold,
        rootMargin,
      }
    );
    
    if (targetSelector) {
      // Observe multiple elements within the ref container
      const elements = ref.current.querySelectorAll(targetSelector);
      elements.forEach(element => observer.observe(element));
    } else {
      // Observe the ref element itself
      observer.observe(ref.current);
    }
    
    return () => {
      if (targetSelector && ref.current) {
        const elements = ref.current.querySelectorAll(targetSelector);
        elements.forEach(element => observer.unobserve(element));
      } else if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [ref, onIntersect, threshold, rootMargin, targetSelector]);
};
