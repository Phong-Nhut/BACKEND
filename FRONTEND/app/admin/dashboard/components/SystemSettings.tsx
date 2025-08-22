"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Shield, Database, Bell, Mail, Server } from "lucide-react"

export function SystemSettings() {
  const settingsGroups = [
    {
      title: "Security Settings",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-100",
      settings: [
        {
          id: "two-factor",
          label: "Two-Factor Authentication",
          description: "Require 2FA for admin accounts",
          enabled: true,
        },
        { id: "session-timeout", label: "Session Timeout", description: "Auto-logout after 30 minutes", enabled: true },
        { id: "ip-whitelist", label: "IP Whitelist", description: "Restrict admin access by IP", enabled: false },
      ],
    },
    {
      title: "Notification Settings",
      icon: Bell,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      settings: [
        {
          id: "email-notifications",
          label: "Email Notifications",
          description: "Send email alerts for important events",
          enabled: true,
        },
        {
          id: "user-approval",
          label: "User Approval Alerts",
          description: "Notify when new users need approval",
          enabled: true,
        },
        {
          id: "game-submission",
          label: "Game Submission Alerts",
          description: "Notify when games are submitted",
          enabled: false,
        },
      ],
    },
    {
      title: "System Maintenance",
      icon: Server,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      settings: [
        { id: "auto-backup", label: "Automatic Backups", description: "Daily database backups", enabled: true },
        { id: "maintenance-mode", label: "Maintenance Mode", description: "Enable maintenance mode", enabled: false },
        { id: "debug-logging", label: "Debug Logging", description: "Enable detailed system logs", enabled: false },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure platform settings and monitor system status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Database Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-3">Healthy</div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">Last backup: 2 hours ago</p>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Server Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-3">Online</div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">Uptime: 99.9%</p>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm">
              Monitor
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Email Service</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-3">Active</div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">Queue: 0 pending</p>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => {
          const Icon = group.icon
          return (
            <Card key={groupIndex} className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className={`p-2 rounded-lg ${group.bgColor}`}>
                    <Icon className={`h-5 w-5 ${group.color}`} />
                  </div>
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.settings.map((setting, settingIndex) => (
                    <div
                      key={settingIndex}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{setting.label}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{setting.description}</p>
                          </div>
                          <Switch
                            checked={setting.enabled}
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            Advanced Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="font-semibold text-gray-900 mb-2">Export System Logs</div>
              <div className="text-sm text-gray-600 leading-relaxed">Download system logs for analysis</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="font-semibold text-gray-900 mb-2">Database Migration</div>
              <div className="text-sm text-gray-600 leading-relaxed">Run database schema updates</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="font-semibold text-gray-900 mb-2">Clear Cache</div>
              <div className="text-sm text-gray-600 leading-relaxed">Clear system cache and temporary files</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start border-gray-200 hover:bg-gray-50 bg-transparent shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="font-semibold text-gray-900 mb-2">System Diagnostics</div>
              <div className="text-sm text-gray-600 leading-relaxed">Run comprehensive system health check</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
