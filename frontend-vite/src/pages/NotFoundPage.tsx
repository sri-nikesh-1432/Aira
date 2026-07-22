import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle, Sun } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Card className="glass p-8 max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 glow-sun">
              <Sun className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-xl font-semibold mb-2">Orbit Malfunction</h2>
            <p className="text-gray-400 mb-6">
              This planet doesn't exist in our solar system. The navigation coordinates you entered don't match any known agent or page.
            </p>
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
