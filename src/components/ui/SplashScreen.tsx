import { motion } from 'framer-motion';

export function SplashScreen() {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#43B02A]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo/Brand */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <span className="text-[#43B02A] font-bold text-4xl tracking-tighter">Fix</span>
                    </div>
                    <h1 className="text-white text-3xl font-bold tracking-tight">Fix Price</h1>
                </motion.div>

                {/* Loading Spinner (Optional, keep it clean like T-Bank) */}
                {/* <motion.div 
            className="absolute bottom-[-60px] w-8 h-8 border-4 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        /> */}
            </div>
        </motion.div>
    );
}
