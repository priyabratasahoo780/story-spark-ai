import { useEffect } from "react";
import { motion } from "framer-motion";
import CommunitySpotlightComponent from "./community_spotlight/community_spotlight.component";
import FeatureComponent from "./feature/feature.component";
import LatestPostsComponent from "./latest_posts/latest_posts.component";
import FeatureProfileComponent from "./feature_profile/feature_profile.component";
import TrendingTopicComponent from "./trending_topic/trending_topic.component";
import RecommendedWritersComponent from "./recommended_writers/recommended_writers.component";
import ResourceComponent from "./resources/resources.component";
import PricingComponent from "./pricing/pricing.component";
import WriterFeedbackComponent from "./writer_feedback/writer_feedback.component";
import StartWritingComponent from "./start_writing/start_writing.component";
import PersonalizedRecommendationsComponent from "./personalized_recommendations/personalized_recommendations.component";
import { isLoggedIn } from "../../services/auth.service";
import BackToTop from "../ScrollToTopButton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const HomeComponent = () => {
  const isLogin = isLoggedIn();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 w-full box-border overflow-x-hidden">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        <div className="grid grid-cols-12 items-start gap-6 lg:gap-8">
          {/* Main Content */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 min-w-0 flex flex-col gap-8">
            <FeatureComponent />
            <LatestPostsComponent />
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 min-w-0">
            <div className="sticky top-24 flex flex-col gap-6">
              {isLogin && <FeatureProfileComponent />}
              {isLogin && <PersonalizedRecommendationsComponent />}
              <TrendingTopicComponent />
              <RecommendedWritersComponent />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        <motion.div variants={itemVariants}><CommunitySpotlightComponent /></motion.div> 
        <motion.div variants={itemVariants}><ResourceComponent /></motion.div>
        <motion.div variants={itemVariants}><WriterFeedbackComponent /></motion.div>
        <motion.div variants={itemVariants}><PricingComponent /></motion.div>
        <motion.div variants={itemVariants}><StartWritingComponent /></motion.div>
      </div>

      <BackToTop />
    </div>
  );
};

export default HomeComponent;
