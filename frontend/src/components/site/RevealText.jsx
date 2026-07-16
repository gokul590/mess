import { motion } from 'framer-motion';

/**
 * Masked line-by-line reveal.
 * Pass `lines` array of strings; each line animates from y:100% to 0 with stagger.
 */
export function RevealLines({ lines, className = '', delay = 0, italicIdx = -1 }) {
    return (
        <span className={className}>
            {lines.map((line, i) => (
                <span key={i} className="block reveal-mask">
                    <motion.span
                        className={`block ${i === italicIdx ? 'italic font-light' : ''}`}
                        initial={{ y: '110%' }}
                        animate={{ y: '0%' }}
                        transition={{
                            delay: delay + i * 0.12,
                            duration: 1.1,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        {line}
                    </motion.span>
                </span>
            ))}
        </span>
    );
}

export function FadeInUp({ children, delay = 0, y = 30, className = '' }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
