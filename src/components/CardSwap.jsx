import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});
const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  onCardChange,
  skewAmount = 6,
  easing = 'elastic',
  maxVisibleCards = 6,
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const totalCards = childArr.length;
  const visibleCount = Math.min(maxVisibleCards, totalCards);
  
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    // Initially position all cards
    refs.forEach((r, i) => {
      if (i < visibleCount) {
        // Position visible cards in the stack
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      } else {
        // Hide cards beyond the visible count by placing them far off-screen
        gsap.set(r.current, {
          x: 0,
          y: 2000,
          z: -i * cardDistance * 1.5,
          xPercent: -50,
          yPercent: -50,
          skewY: 0,
          zIndex: -1,
          opacity: 0,
          force3D: true
        });
      }
    });

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      // Drop the front card
      tl.to(elFront, {
        y: '+=500',
        opacity: 0,
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      
      // Promote visible cards forward
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (i < visibleCount - 1) {
          // Move visible cards forward in the stack
          const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
          tl.set(el, { zIndex: slot.zIndex, opacity: 1 }, 'promote');
          tl.to(
            el,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              duration: config.durMove,
              ease: config.ease
            },
            `promote+=${i * 0.15}`
          );
        } else if (i === visibleCount - 1) {
          // Bring the next card into view at the back of the stack
          const slot = makeSlot(visibleCount - 1, cardDistance, verticalDistance, refs.length);
          tl.set(el, { zIndex: slot.zIndex, opacity: 0 }, 'promote');
          tl.to(
            el,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              opacity: 1,
              duration: config.durMove,
              ease: config.ease
            },
            `promote+=${(visibleCount - 1) * 0.15}`
          );
        }
      });

      // Return the front card to the back (hidden)
      const backSlot = makeSlot(visibleCount - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: -1, opacity: 0 });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: 0,
          y: 2000,
          z: backSlot.z,
          opacity: 0,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
        // Notify parent component of card change
        if (onCardChange) {
          onCardChange(rest[0]); // The new front card index
        }
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, visibleCount]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
