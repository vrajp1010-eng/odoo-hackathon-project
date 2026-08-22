'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, Edit2, MapPin, Plus, Trash2, Map as MapIcon, DollarSign, Settings, Globe, Lock, Clock } from 'lucide-react'

// Import server actions (assuming they are set up)
import { updateTrip, deleteTrip } from '@/actions/trip-actions'
import { addTripStop, removeTripStop } from '@/actions/stop-actions'
import { addTripActivity, removeTripActivity } from '@/actions/activity-actions'
import { updateBudget } from '@/actions/budget-actions'
import { searchCities, searchActivities } from '@/actions/catalog-actions'
import { calculateTripScore } from '@/lib/trip-score'

export function TripDetailClient({ initialTrip }: { initialTrip: any }) {
  const router = useRouter()
  const trip = initialTrip
  
  // Settings Tab State
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    title: trip.title,
    description: trip.description || '',
    startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
    endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
    isPublic: trip.isPublic
  })
  
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: trip.budget?.totalBudget || 0,
    transportBudget: trip.budget?.transportBudget || 0,
    stayBudget: trip.budget?.stayBudget || 0,
    activityBudget: trip.budget?.activityBudget || 0,
    mealBudget: trip.budget?.mealBudget || 0
  })

  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [searchCityQuery, setSearchCityQuery] = useState('')
  const [cityResults, setCityResults] = useState<any[]>([])

  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [searchActivityQuery, setSearchActivityQuery] = useState('')
  const [activityResults, setActivityResults] = useState<any[]>([])
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)

  // Basic helpers for calculated fields
  const totalSpent = (trip.tripStops || []).reduce((total: number, stop: any) => {
    return total + (stop.tripActivities || []).reduce((sum: number, act: any) => sum + (act.customCost || 0), 0)
  }, 0)
  const budgetStatus = budgetForm.totalBudget - totalSpent
  
  // Trip Health Score — calculated from current trip data
  const scoreResult = calculateTripScore(trip)
  
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingSettings(true)
    try {
      await updateTrip({ id: trip.id, ...settingsForm })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdatingSettings(false)
    }
  }

  const handleDeleteTrip = async () => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      await deleteTrip(trip.id)
      router.push('/trips')
    }
  }

  const handleBudgetUpdate = async () => {
    try {
      await updateBudget({ 
        tripId: trip.id, 
        totalBudget: budgetForm.totalBudget, 
        transportBudget: budgetForm.transportBudget, 
        stayBudget: budgetForm.stayBudget, 
        activityBudget: budgetForm.activityBudget, 
        mealBudget: budgetForm.mealBudget
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearchCities = async () => {
    const res = await searchCities(searchCityQuery)
    setCityResults(res || [])
  }

  const handleAddCity = async (cityId: string) => {
    await addTripStop({ tripId: trip.id, cityId, arrivalDate: new Date().toISOString(), departureDate: new Date().toISOString() })
    setIsCityDialogOpen(false)
    setSearchCityQuery('')
    setCityResults([])
    router.refresh()
  }

  const handleSearchActivities = async () => {
    const stop = trip.tripStops.find((s: any) => s.id === selectedStopId)
    if (stop) {
      const res = await searchActivities(stop.cityId, searchActivityQuery)
      setActivityResults(res || [])
    }
  }

  const handleAddActivity = async (activityId: string) => {
    if (selectedStopId) {
      await addTripActivity({ tripStopId: selectedStopId, activityId, customCost: 0 })
      setIsActivityDialogOpen(false)
      setSearchActivityQuery('')
      setActivityResults([])
      setSelectedStopId(null)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Score Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold truncate hidden sm:block">{trip.title}</h1>
            <Badge variant={trip.isPublic ? 'default' : 'secondary'} className="shrink-0">
              {trip.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {trip.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
          {/* Score Widget */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* SVG Score Ring */}
              <div className="relative h-10 w-10">
                <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9155" fill="none"
                    stroke={scoreResult.score >= 85 ? '#22c55e' : scoreResult.score >= 70 ? '#3b82f6' : scoreResult.score >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${scoreResult.score} ${100 - scoreResult.score}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{scoreResult.score}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold">Trip Score</p>
                <p className={`text-xs font-bold ${scoreResult.color}`}>{scoreResult.label}</p>
              </div>
            </div>
            {/* Top breakdown tip */}
            {scoreResult.breakdown.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-100 rounded-full px-3 py-1.5 max-w-xs">
                <span className={scoreResult.breakdown[0].points > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {scoreResult.breakdown[0].points > 0 ? '✓' : '!'}
                </span>
                <span className="truncate">{scoreResult.breakdown[0].tip}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/trips" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
              <Badge variant={trip.isPublic ? "default" : "secondary"}>
                {trip.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                {trip.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="itinerary"><MapIcon className="h-4 w-4 mr-2 hidden sm:block" /> Itinerary</TabsTrigger>
          <TabsTrigger value="budget"><DollarSign className="h-4 w-4 mr-2 hidden sm:block" /> Budget</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="h-4 w-4 mr-2 hidden sm:block" /> Calendar</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2 hidden sm:block" /> Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="itinerary" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Stops & Activities</h2>
            <Button onClick={() => setIsCityDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add City</Button>
          </div>

          <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a City</DialogTitle>
                <DialogDescription>Search for a city to add to your trip.</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input value={searchCityQuery} onChange={(e) => setSearchCityQuery(e.target.value)} placeholder="Search cities..." />
                <Button onClick={handleSearchCities}>Search</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cityResults.map(city => (
                  <div key={city.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{city.name}, {city.country}</span>
                    <Button size="sm" onClick={() => handleAddCity(city.id)}>Add</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Activity</DialogTitle>
                <DialogDescription>Search for an activity in this city.</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input value={searchActivityQuery} onChange={(e) => setSearchActivityQuery(e.target.value)} placeholder="Search activities..." />
                <Button onClick={handleSearchActivities}>Search</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityResults.map(activity => (
                  <div key={activity.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{activity.name} - ${activity.estimatedCost}</span>
                    <Button size="sm" onClick={() => handleAddActivity(activity.id)}>Add</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          {(!trip.tripStops || trip.tripStops.length === 0) ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No stops added yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first destination to start building your itinerary.</p>
                <Button variant="outline" onClick={() => setIsCityDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add City</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {trip.tripStops.map((stop: any, index: number) => (
                <Card key={stop.id} className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -z-10 hidden sm:block"></div>
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4 border-b">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{stop.city?.name || 'Unknown City'}</CardTitle>
                        <CardDescription>
                          {stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString() : 'N/A'} - {stop.departureDate ? new Date(stop.departureDate).toLocaleDateString() : 'N/A'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                      await removeTripStop(stop.id)
                      router.refresh()
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {(!stop.tripActivities || stop.tripActivities.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No activities planned here yet.</p>
                      ) : (
                        stop.tripActivities.map((activityInfo: any) => (
                          <div key={activityInfo.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">{activityInfo.activity?.name}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {activityInfo.startTime || 'Any time'} - {activityInfo.endTime || 'Any time'}</span>
                                <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> ${activityInfo.customCost || 0}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                              await removeTripActivity(activityInfo.id)
                              router.refresh()
                            }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))
                      )}
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                        setSelectedStopId(stop.id)
                        setIsActivityDialogOpen(true)
                      }}><Plus className="h-4 w-4 mr-2" /> Add Activity</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-3xl font-bold">${budgetForm.totalBudget}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Spent</p>
                  <p className="text-2xl font-semibold">${totalSpent}</p>
                </div>
                <div className={`p-3 rounded-md ${budgetStatus >= 0 ? 'bg-green-500/15 text-green-700' : 'bg-red-500/15 text-red-700'}`}>
                  <p className="text-sm font-medium">{budgetStatus >= 0 ? 'Remaining' : 'Over Budget'}</p>
                  <p className="text-xl font-bold">${Math.abs(budgetStatus)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Budget Allocations</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Budget</Label>
                  <Input type="number" value={budgetForm.totalBudget} onChange={e => setBudgetForm({...budgetForm, totalBudget: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Transport</Label>
                  <Input type="number" value={budgetForm.transportBudget} onChange={e => setBudgetForm({...budgetForm, transportBudget: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Stay</Label>
                  <Input type="number" value={budgetForm.stayBudget} onChange={e => setBudgetForm({...budgetForm, stayBudget: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Activities</Label>
                  <Input type="number" value={budgetForm.activityBudget} onChange={e => setBudgetForm({...budgetForm, activityBudget: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Meals</Label>
                  <Input type="number" value={budgetForm.mealBudget} onChange={e => setBudgetForm({...budgetForm, mealBudget: Number(e.target.value)})} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleBudgetUpdate}>Save Budget</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Calendar</CardTitle>
              <CardDescription>View your activities in a calendar layout.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center border-dashed border-2 rounded-md bg-muted/20">
              <p className="text-muted-foreground text-sm">Calendar view coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <form onSubmit={handleSettingsUpdate}>
                <CardHeader>
                  <CardTitle>Trip Settings</CardTitle>
                  <CardDescription>Update your trip details and privacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Trip Title</Label>
                    <Input id="title" value={settingsForm.title} onChange={e => setSettingsForm({...settingsForm, title: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" value={settingsForm.startDate} onChange={e => setSettingsForm({...settingsForm, startDate: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" value={settingsForm.endDate} onChange={e => setSettingsForm({...settingsForm, endDate: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={4} value={settingsForm.description} onChange={e => setSettingsForm({...settingsForm, description: e.target.value})} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Trip</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this trip visible to others.
                      </p>
                    </div>
                    <Switch 
                      checked={settingsForm.isPublic}
                      onCheckedChange={(c) => setSettingsForm({...settingsForm, isPublic: c})}
                    />
                  </div>
                  {settingsForm.isPublic && (
                    <div className="text-sm p-3 bg-muted rounded-md flex items-center justify-between">
                      <span className="truncate mr-2">Public URL: {typeof window !== 'undefined' ? window.location.origin : ''}/t/{trip.id}</span>
                      <Button variant="ghost" size="sm" type="button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/t/${trip.id}`)}>Copy</Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingSettings}>
                    {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5" /> Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete this trip and all its data, including itinerary stops, activities, and budget allocations.
                </p>
                <Button variant="destructive" className="w-full" onClick={handleDeleteTrip}>
                  Delete Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
