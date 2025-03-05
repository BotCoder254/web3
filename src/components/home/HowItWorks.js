import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCoins, FaChartLine } from 'react-icons/fa';

const steps = [
  {
    icon: <FaSearch className="w-8 h-8" />,
    title: 'Browse Properties',
    description:
      'Explore our curated selection of premium real estate properties available for tokenization.',
  },
  {
    icon: <FaCoins className="w-8 h-8" />,
    title: 'Purchase Tokens',
    description:
      'Buy tokens representing fractional ownership in properties of your choice.',
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: 'Earn Returns',
    description:
      'Receive your share of rental income and property value appreciation.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Get started with real estate tokenization in three simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative p-6 bg-background rounded-lg"
            >
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="text-primary mb-4 mt-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors">
            Get Started Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 