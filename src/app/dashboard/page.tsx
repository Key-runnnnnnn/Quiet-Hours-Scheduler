"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || user?.email}!
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          {/* Database Setup Notice */}
          {user?.created_at && new Date(user.created_at).getFullYear() === new Date().getFullYear() && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Database Setup Required</CardTitle>
                <CardDescription className="text-yellow-700">
                  To enable full functionality, please set up your Supabase database tables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 mb-4">
                  Follow the instructions in the <code>/database/README.md</code> file to create the necessary tables and policies.
                </p>
                <div className="text-sm text-yellow-700">
                  <strong>Quick setup:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Run the SQL files in the database folder</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Manage your study time blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Schedule and manage your quiet study sessions with automated
                  email reminders.
                </p>
                <Button className="mt-4 w-full">Manage Quiet Hours</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled quiet times</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  No upcoming sessions scheduled.
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Email reminder settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Email reminders are enabled 10 minutes before each session.
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
