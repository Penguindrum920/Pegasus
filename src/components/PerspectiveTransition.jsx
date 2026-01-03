import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from 'react';
import './PerspectiveTransition.css';

const PerspectiveTransition = ({ section1, section2 }) => {
  const container = useRef();
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  });

  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, -5]);
  
  const scale2 = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [5, 0]);

  return (
    <div ref={container} className="perspective-container">
      <motion.div 
        style={{ scale: scale1, rotate: rotate1 }} 
        className="perspective-section-1"
      >
        {section1}
      </motion.div>
      <motion.div 
        style={{ scale: scale2, rotate: rotate2 }} 
        className="perspective-section-2"
      >
        {section2}
      </motion.div>
    </div>
  );
};

export default PerspectiveTransition;
