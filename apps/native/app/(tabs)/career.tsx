import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  Briefcase,
  FileText,
  Lightbulb,
  Sparkles,
  Plus,
  Trash2,
  Palette,
  Eye,
  Search,
  MapPin,
  ExternalLink,
  RefreshCw,
  X,
  BookOpen,
  Heart,
  Globe,
  Building2,
  Clock,
  DollarSign,
  Loader2,
  CalendarDays,
  GraduationCap,
  Award,
  Lock,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import { useAuth } from "../../hooks/useAuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { supabase } from "../../services/supabase";
import { streamAIChat } from "../../lib/ai";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "@studentos/shared";
import FeatureGateSheet from "../../components/subscription/FeatureGateSheet";
import {
  ResumeData,
  emptyResumeData,
  templates,
  renderResumeHTML,
} from "../../components/career/ResumeTemplates";

const TABS = [
  { key: "resume", label: "Resume", Icon: FileText },
  { key: "jobs", label: "Jobs", Icon: Briefcase },
  { key: "why", label: "Why", Icon: Lightbulb },
];

const JOB_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Internship", value: "internship" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
];
const REMOTE_OPTIONS = [
  { label: "Any Location", value: "all" },
  { label: "Remote Only", value: "remote" },
  { label: "On-site", value: "onsite" },
];
const DATE_OPTIONS = [
  { label: "Past 24 hours", value: "today" },
  { label: "Past 3 days", value: "3days" },
  { label: "Past week", value: "week" },
  { label: "Past month", value: "month" },
  { label: "Any time", value: "all" },
];

interface JobListing {
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  type: string;
  description: string;
  applyUrl: string | null;
  jobUrl: string | null;
  isRemote: boolean;
  postedDate: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string | null;
  publisher: string | null;
  highlights: string[];
}

interface Internship {
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string;
  applyUrl?: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function formatSalary(job: JobListing): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  const currency = job.salaryCurrency === "USD" ? "$" : job.salaryCurrency + " ";
  if (job.salaryMin && job.salaryMax) return `${currency}${fmt(job.salaryMin)} - ${currency}${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `From ${currency}${fmt(job.salaryMin)}`;
  return `Up to ${currency}${fmt(job.salaryMax!)}`;
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    FULLTIME: "Full-time",
    PARTTIME: "Part-time",
    INTERN: "Internship",
    CONTRACTOR: "Contract",
  };
  return map[type] || type;
}

export default function CareerScreen() {
  const [activeTab, setActiveTab] = useState("resume");

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12 pb-24">
        <Animated.View entering={FadeIn.duration(300)}>
          <Text className="text-2xl font-bold text-foreground">Career</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Connect your learning to real-world opportunities
          </Text>
        </Animated.View>

        <View className="flex-row mt-6 mb-4 rounded-lg bg-muted/50 p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md",
                  isActive ? "bg-card shadow-sm" : ""
                )}
              >
                <tab.Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <Text
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "resume" && <ResumeBuilder />}
        {activeTab === "jobs" && <InternshipMatcher />}
        {activeTab === "why" && <RealWorldWhy />}
      </View>
    </ScrollView>
  );
}

function ResumeBuilder() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [data, setData] = useState<ResumeData>({ ...emptyResumeData });
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState("contact");
  const [showPreview, setShowPreview] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const templateLimit = subscription.limits.resumeTemplatesLimit;

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: courses } = await supabase
        .from("courses")
        .select("name, progress")
        .eq("user_id", user?.id || "")
        .gte("progress", 50);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, full_name")
        .eq("user_id", user?.id || "")
        .maybeSingle();

      if (courses) {
        const autoSkills = courses.map((c) => ({
          name: c.name,
          level: (c.progress ?? 0) >= 90 ? "Advanced" : (c.progress ?? 0) >= 70 ? "Intermediate" : "Beginner",
        }));
        setData((d) => ({ ...d, skills: autoSkills }));
      }
      if (profile) {
        setData((d) => ({ ...d, name: profile.full_name || profile.display_name || "" }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const update = <K extends keyof ResumeData>(key: K, val: ResumeData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const addItem = (key: "education" | "experience" | "projects" | "certifications" | "languages" | "skills") => {
    const defaults: Record<string, any> = {
      education: { school: "", degree: "", year: "", gpa: "" },
      experience: { title: "", company: "", period: "", description: "" },
      projects: { name: "", description: "", tech: "" },
      certifications: { name: "", issuer: "", year: "" },
      languages: { language: "", proficiency: "" },
      skills: { name: "", level: "Beginner" },
    };
    setData((d) => ({ ...d, [key]: [...d[key], defaults[key]] }));
  };

  const removeItem = (key: string, idx: number) => {
    setData((d) => ({ ...d, [key]: (d as any)[key].filter((_: any, i: number) => i !== idx) }));
  };

  const updateItem = (key: string, idx: number, field: string, val: string) => {
    setData((d) => {
      const arr = [...(d as any)[key]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...d, [key]: arr };
    });
  };

  const generateSummary = async () => {
    if (data.skills.length === 0) {
      Toast.show({ type: "error", text1: "Add skills first" });
      return;
    }
    setGenerating(true);
    update("summary", "");
    const skillList = data.skills.map((s) => `${s.name} (${s.level})`).join(", ");
    const expList = data.experience.map((e) => `${e.title} at ${e.company}`).join(", ");
    const prompt = `Write a professional resume summary (2-3 sentences) for someone with skills: ${skillList}. ${expList ? `Experience: ${expList}.` : ""} Don't use "I". Be confident but not arrogant.`;
    try {
      await streamAIChat({
        messages: [{ role: "user", content: prompt }],
        onDelta: (chunk) => setData((d) => ({ ...d, summary: d.summary + chunk })),
        onDone: () => setGenerating(false),
        onError: (err) => {
          Toast.show({ type: "error", text1: err });
          setGenerating(false);
        },
      });
    } catch {
      setGenerating(false);
    }
  };

  const exportText = () => {
    const lines = [
      data.name,
      [data.email, data.phone, data.location, data.website].filter(Boolean).join(" | "),
      "",
      data.summary ? `SUMMARY\n${data.summary}\n` : "",
      data.education.length ? `EDUCATION\n${data.education.map((e) => `${e.degree} — ${e.school} (${e.year})`).join("\n")}\n` : "",
      data.experience.length ? `EXPERIENCE\n${data.experience.map((e) => `${e.title} at ${e.company} (${e.period})\n${e.description}`).join("\n\n")}\n` : "",
      data.skills.length ? `SKILLS\n${data.skills.map((s) => `• ${s.name} — ${s.level}`).join("\n")}\n` : "",
      data.projects.length ? `PROJECTS\n${data.projects.map((p) => `${p.name}${p.tech ? ` (${p.tech})` : ""}\n${p.description}`).join("\n\n")}\n` : "",
    ]
      .filter(Boolean)
      .join("\n");
    Alert.alert("Resume Text", lines.slice(0, 500) + "...");
  };

  const SECTION_TABS = [
    { key: "contact", label: "Contact" },
    { key: "edu", label: "Edu" },
    { key: "exp", label: "Exp" },
    { key: "more", label: "More" },
  ];

  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Palette size={20} className="text-primary" />
              <Text className="font-semibold text-foreground">Templates</Text>
            </View>
            <Button
              size="sm"
              variant={showPreview ? "default" : "outline"}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Eye size={14} className="mr-1" />
              <Text className={showPreview ? "text-primary-foreground" : "text-foreground"}>
                {showPreview ? "Edit" : "Preview"}
              </Text>
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {templates.map((t, idx) => {
                const isLocked = idx >= templateLimit;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      if (isLocked) {
                        setShowGate(true);
                      } else {
                        setSelectedTemplate(t.id);
                      }
                    }}
                    className={cn(
                      "items-center p-2 rounded-lg border w-16",
                      isLocked
                        ? "border-border opacity-50"
                        : selectedTemplate === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                    )}
                  >
                    {isLocked && (
                      <View className="absolute inset-0 items-center justify-center bg-background/60 rounded-lg z-10">
                        <Lock size={14} className="text-muted-foreground" />
                      </View>
                    )}
                    <View
                      className="w-8 h-10 rounded border mb-1"
                      style={{ borderColor: t.accent }}
                    >
                      <View className="w-full h-2 rounded-t" style={{ backgroundColor: t.accent }} />
                    </View>
                    <Text className="text-[10px] text-muted-foreground text-center">{t.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </CardContent>
      </Card>

      {showPreview ? (
        <View className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <View className="border border-border rounded-lg overflow-hidden bg-white" style={{ height: 420 }}>
                <ScrollView className="flex-1 p-4">
                  <Text className="text-xs text-foreground font-mono">
                    {renderResumeHTML(data, selectedTemplate)}
                  </Text>
                </ScrollView>
              </View>
            </CardContent>
          </Card>
          <View className="flex-row gap-2">
            <Button className="flex-1" onPress={exportText}>
              <FileText size={14} className="mr-1" />
              <Text className="text-primary-foreground">Export Text</Text>
            </Button>
          </View>
        </View>
      ) : (
        <Card>
          <CardContent className="p-4">
            <View className="flex-row mb-4 rounded-md bg-muted/30 p-1">
              {SECTION_TABS.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setActiveSection(s.key)}
                  className={cn(
                    "flex-1 py-1.5 rounded items-center",
                    activeSection === s.key ? "bg-card" : ""
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs",
                      activeSection === s.key ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeSection === "contact" && (
              <View className="space-y-3">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-1">Full Name</Text>
                    <TextInput
                      className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                      value={data.name}
                      onChangeText={(v) => update("name", v)}
                      placeholder="John Doe"
                      placeholderTextColor="#94A3B8""
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-1">Email</Text>
                    <TextInput
                      className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                      value={data.email}
                      onChangeText={(v) => update("email", v)}
                      placeholder="john@example.com"
                      placeholderTextColor="#94A3B8""
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-1">Phone</Text>
                    <TextInput
                      className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                      value={data.phone}
                      onChangeText={(v) => update("phone", v)}
                      placeholder="+1 234 567 8900"
                      placeholderTextColor="#94A3B8""
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-1">Location</Text>
                    <TextInput
                      className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                      value={data.location}
                      onChangeText={(v) => update("location", v)}
                      placeholder="City, Country"
                      placeholderTextColor="#94A3B8""
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Website / LinkedIn</Text>
                  <TextInput
                    className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                    value={data.website}
                    onChangeText={(v) => update("website", v)}
                    placeholder="linkedin.com/in/johndoe"
                    placeholderTextColor="#94A3B8""
                  />
                </View>
                <View>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs text-muted-foreground">Professional Summary</Text>
                    <Button size="sm" variant="outline" onPress={generateSummary} disabled={generating}>
                      <Sparkles size={12} className="mr-1" />
                      <Text className="text-foreground">{generating ? "..." : "AI"}</Text>
                    </Button>
                  </View>
                  <TextInput
                    className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background"
                    value={data.summary}
                    onChangeText={(v) => update("summary", v)}
                    placeholder="Brief professional summary..."
                    placeholderTextColor="#94A3B8""
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}

            {activeSection === "edu" && (
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <GraduationCap size={16} className="text-foreground" />
                    <Text className="text-sm font-medium text-foreground">Education</Text>
                  </View>
                  <Button size="sm" variant="outline" onPress={() => addItem("education")}>
                    <Plus size={14} />
                  </Button>
                </View>
                {data.education.map((e, i) => (
                  <View key={i} className="p-3 rounded-lg border border-border space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">#{i + 1}</Text>
                      <Pressable onPress={() => removeItem("education", i)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="School"
                        value={e.school}
                        onChangeText={(v) => updateItem("education", i, "school", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Degree"
                        value={e.degree}
                        onChangeText={(v) => updateItem("education", i, "degree", v)}
                        placeholderTextColor="#94A3B8""
                      />
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Year"
                        value={e.year}
                        onChangeText={(v) => updateItem("education", i, "year", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="GPA (optional)"
                        value={e.gpa}
                        onChangeText={(v) => updateItem("education", i, "gpa", v)}
                        placeholderTextColor="#94A3B8""
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeSection === "exp" && (
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <Briefcase size={16} className="text-foreground" />
                    <Text className="text-sm font-medium text-foreground">Experience</Text>
                  </View>
                  <Button size="sm" variant="outline" onPress={() => addItem("experience")}>
                    <Plus size={14} />
                  </Button>
                </View>
                {data.experience.map((e, i) => (
                  <View key={i} className="p-3 rounded-lg border border-border space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">#{i + 1}</Text>
                      <Pressable onPress={() => removeItem("experience", i)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Job Title"
                        value={e.title}
                        onChangeText={(v) => updateItem("experience", i, "title", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Company"
                        value={e.company}
                        onChangeText={(v) => updateItem("experience", i, "company", v)}
                        placeholderTextColor="#94A3B8""
                      />
                    </View>
                    <TextInput
                      className="border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                      placeholder="Period (e.g. 2023-Present)"
                      value={e.period}
                      onChangeText={(v) => updateItem("experience", i, "period", v)}
                      placeholderTextColor="#94A3B8""
                    />
                    <TextInput
                      className="border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                      placeholder="Description of responsibilities and achievements"
                      value={e.description}
                      onChangeText={(v) => updateItem("experience", i, "description", v)}
                      placeholderTextColor="#94A3B8""
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>
                ))}
              </View>
            )}

            {activeSection === "more" && (
              <View className="space-y-4">
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1">
                      <Award size={16} className="text-foreground" />
                      <Text className="text-sm font-medium text-foreground">Skills</Text>
                    </View>
                    <Button size="sm" variant="outline" onPress={() => addItem("skills")}>
                      <Plus size={14} />
                    </Button>
                  </View>
                  {data.skills.map((s, i) => (
                    <View key={i} className="flex-row items-center gap-2 mb-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Skill"
                        value={s.name}
                        onChangeText={(v) => updateItem("skills", i, "name", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <SelectDropdown
                        value={s.level}
                        options={[
                          { label: "Beginner", value: "Beginner" },
                          { label: "Intermediate", value: "Intermediate" },
                          { label: "Advanced", value: "Advanced" },
                        ]}
                        onChange={(v) => updateItem("skills", i, "level", v)}
                      />
                      <Pressable onPress={() => removeItem("skills", i)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                  ))}
                </View>
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-foreground">Projects</Text>
                    <Button size="sm" variant="outline" onPress={() => addItem("projects")}>
                      <Plus size={14} />
                    </Button>
                  </View>
                  {data.projects.map((p, i) => (
                    <View key={i} className="p-3 rounded-lg border border-border space-y-2 mb-2">
                      <View className="flex-row justify-end">
                        <Pressable onPress={() => removeItem("projects", i)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Pressable>
                      </View>
                      <View className="flex-row gap-2">
                        <TextInput
                          className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                          placeholder="Project Name"
                          value={p.name}
                          onChangeText={(v) => updateItem("projects", i, "name", v)}
                          placeholderTextColor="#94A3B8""
                        />
                        <TextInput
                          className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                          placeholder="Technologies"
                          value={p.tech}
                          onChangeText={(v) => updateItem("projects", i, "tech", v)}
                          placeholderTextColor="#94A3B8""
                        />
                      </View>
                      <TextInput
                        className="border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Description"
                        value={p.description}
                        onChangeText={(v) => updateItem("projects", i, "description", v)}
                        placeholderTextColor="#94A3B8""
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                      />
                    </View>
                  ))}
                </View>
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-foreground">Certifications</Text>
                    <Button size="sm" variant="outline" onPress={() => addItem("certifications")}>
                      <Plus size={14} />
                    </Button>
                  </View>
                  {data.certifications.map((c, i) => (
                    <View key={i} className="flex-row items-center gap-2 mb-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Name"
                        value={c.name}
                        onChangeText={(v) => updateItem("certifications", i, "name", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Issuer"
                        value={c.issuer}
                        onChangeText={(v) => updateItem("certifications", i, "issuer", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <TextInput
                        className="w-16 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Year"
                        value={c.year}
                        onChangeText={(v) => updateItem("certifications", i, "year", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <Pressable onPress={() => removeItem("certifications", i)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                  ))}
                </View>
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-foreground">Languages</Text>
                    <Button size="sm" variant="outline" onPress={() => addItem("languages")}>
                      <Plus size={14} />
                    </Button>
                  </View>
                  {data.languages.map((l, i) => (
                    <View key={i} className="flex-row items-center gap-2 mb-2">
                      <TextInput
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
                        placeholder="Language"
                        value={l.language}
                        onChangeText={(v) => updateItem("languages", i, "language", v)}
                        placeholderTextColor="#94A3B8""
                      />
                      <SelectDropdown
                        value={l.proficiency}
                        options={[
                          { label: "Native", value: "Native" },
                          { label: "Fluent", value: "Fluent" },
                          { label: "Intermediate", value: "Intermediate" },
                          { label: "Basic", value: "Basic" },
                        ]}
                        onChange={(v) => updateItem("languages", i, "proficiency", v)}
                      />
                      <Pressable onPress={() => removeItem("languages", i)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {!showPreview && (
        <View className="flex-row gap-2">
          <Button className="flex-1" onPress={exportText}>
            <FileText size={14} className="mr-1" />
            <Text className="text-primary-foreground">Export Text</Text>
          </Button>
        </View>
      )}

      <FeatureGateSheet
        open={showGate}
        onOpenChange={setShowGate}
        feature="resume templates"
        currentUsage={templates.length}
        limit={templateLimit}
        requiredTier="plus"
      />
    </Animated.View>
  );
}

function InternshipMatcher() {
  const { user } = useAuth();
  const { subscription, gateFeature, incrementUsage } = useSubscription();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [innerTab, setInnerTab] = useState("matched");
  const [showGate, setShowGate] = useState(false);
  const [gateData, setGateData] = useState<any>(null);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: courses } = await supabase.from("courses").select("name").eq("user_id", user?.id || "");
      if (courses) setUserSkills(courses.map((c) => c.name));
    } catch {}
  };

  const addSkill = () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      setUserSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => setUserSkills((prev) => prev.filter((s) => s !== skill));

  const findInternships = async () => {
    if (userSkills.length === 0) {
      Toast.show({ type: "error", text1: "Add some skills first" });
      return;
    }
    setLoading(true);
    setInternships([]);

    try {
      const { data, error } = await supabase.functions.invoke("job-search", {
        body: { query: `${userSkills.join(" ")} internship`, jobType: "internship" },
      });

      if (error) throw error;

      if (data?.success && data.jobs) {
        setInternships(
          data.jobs.map((j: any) => ({
            title: j.title,
            company: j.company,
            description: j.description,
            skills: j.highlights || [],
            location: j.location,
            applyUrl: j.applyUrl || j.jobUrl,
          }))
        );
        if (data.jobs.length === 0) {
          Toast.show({ type: "info", text1: "No internships found", text2: "Try different skills" });
        }
      } else {
        Toast.show({ type: "error", text1: data?.error || "Search failed" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to find internships" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <View className="flex-row mb-2 rounded-md bg-muted/30 p-1">
        {[
          { key: "matched", label: "AI", Icon: Sparkles },
          { key: "search", label: "Live", Icon: Search },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setInnerTab(t.key)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md",
              innerTab === t.key ? "bg-card" : ""
            )}
          >
            <t.Icon size={14} className={innerTab === t.key ? "text-primary" : "text-muted-foreground"} />
            <Text className={cn("text-xs", innerTab === t.key ? "text-foreground font-medium" : "text-muted-foreground")}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {innerTab === "matched" ? (
        <>
          <Card>
            <CardContent className="p-4">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Briefcase size={20} className="text-primary" />
                </View>
                <View>
                  <Text className="font-semibold text-foreground text-sm">AI Internship Matcher</Text>
                  <Text className="text-xs text-muted-foreground">Based on your skills</Text>
                </View>
              </View>
              <Text className="text-xs text-muted-foreground mb-2">Your skills:</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {userSkills.map((skill, i) => (
                  <View
                    key={i}
                    className="flex-row items-center gap-1 px-2.5 py-1 bg-primary/10 rounded-full"
                  >
                    <Text className="text-primary text-xs">{skill}</Text>
                    <Pressable onPress={() => removeSkill(skill)}>
                      <X size={12} className="text-primary" />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 border border-border rounded-md px-2 py-1.5 text-xs text-foreground bg-background"
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="Add a skill..."
                  placeholderTextColor="#94A3B8""
                  onSubmitEditing={addSkill}
                />
                <Button size="sm" variant="outline" onPress={addSkill}>
                  <Plus size={12} />
                </Button>
              </View>
              <Button className="w-full mt-3" onPress={findInternships} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Sparkles size={16} className="mr-1" />
                    <Text className="text-primary-foreground">Find Matches</Text>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {internships.map((internship, i) => (
            <Animated.View key={i} entering={FadeIn.duration(200).delay(i * 50)}>
              <Card>
                <CardContent className="p-4">
                  <Text className="font-semibold text-foreground">{internship.title}</Text>
                  <Text className="text-sm text-primary">{internship.company}</Text>
                  <Text className="text-sm text-muted-foreground my-2" numberOfLines={2}>
                    {internship.description}
                  </Text>
                  <View className="flex-row flex-wrap gap-1 mb-2">
                    {internship.skills.slice(0, 4).map((s, si) => (
                      <View key={si} className="px-2 py-0.5 bg-muted rounded">
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {s}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} className="text-muted-foreground" />
                      <Text className="text-xs text-muted-foreground">{internship.location}</Text>
                    </View>
                    {internship.applyUrl ? (
                      <Pressable
                        className="flex-row items-center gap-1"
                        onPress={() => Linking.openURL(internship.applyUrl!)}
                      >
                        <Text className="text-xs text-primary font-medium">Apply</Text>
                        <ExternalLink size={12} className="text-primary" />
                      </Pressable>
                    ) : null}
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          ))}

          {internships.length > 0 && (
            <Button variant="outline" className="w-full" onPress={findInternships}>
              <RefreshCw size={14} className="mr-1" />
              <Text className="text-foreground">Find More</Text>
            </Button>
          )}
        </>
      ) : (
        <JobSearchWidget
          gateFeature={gateFeature}
          incrementUsage={incrementUsage}
          showGate={showGate}
          setShowGate={setShowGate}
          gateData={gateData}
          setGateData={setGateData}
        />
      )}

      {gateData && (
        <FeatureGateSheet
          open={showGate}
          onOpenChange={setShowGate}
          feature="job searches this month"
          currentUsage={gateData.currentUsage}
          limit={gateData.limit}
          requiredTier={gateData.requiredTier}
        />
      )}
    </Animated.View>
  );
}

function JobSearchWidget({
  gateFeature,
  incrementUsage,
  showGate,
  setShowGate,
  gateData,
  setGateData,
}: {
  gateFeature: any;
  incrementUsage: any;
  showGate: boolean;
  setShowGate: (v: boolean) => void;
  gateData: any;
  setGateData: (v: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [remote, setRemote] = useState("all");
  const [datePosted, setDatePosted] = useState("month");
  const [results, setResults] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerKey, setPickerKey] = useState("");
  const [pickerOptions, setPickerOptions] = useState<{ label: string; value: string }[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerOnChange, setPickerOnChange] = useState<((v: string) => void) | null>(null);

  const openPicker = (
    opts: { label: string; value: string }[],
    current: string,
    onChange: (v: string) => void
  ) => {
    setPickerOptions(opts);
    setPickerKey(current);
    setPickerOnChange(() => onChange);
    setPickerVisible(true);
  };

  const searchJobs = async () => {
    if (!query.trim()) {
      Toast.show({ type: "error", text1: "Enter a search query" });
      return;
    }
    const gate = gateFeature("jobSearch");
    if (!gate.allowed) {
      setGateData(gate);
      setShowGate(true);
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("job-search", {
        body: { query, location, jobType, remote, datePosted },
      });
      if (error) throw error;
      if (data?.success && data.jobs) {
        await incrementUsage("jobSearch");
        setResults(data.jobs);
        if (data.jobs.length === 0) {
          Toast.show({ type: "info", text1: "No results found" });
        }
      } else {
        Toast.show({ type: "error", text1: data?.error || "Search failed" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Search size={20} className="text-primary" />
            <Text className="font-semibold text-foreground">Search Real Jobs</Text>
          </View>
          <TextInput
            className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background mb-3"
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Software Engineer, Intern..."
            placeholderTextColor="#94A3B8""
            onSubmitEditing={searchJobs}
          />
          <View className="flex-row gap-2 mb-2">
            <TextInput
              className="flex-1 border border-border rounded-md px-2 py-1.5 text-sm text-foreground bg-background"
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
              placeholderTextColor="#94A3B8""
            />
            <Pressable
              className="flex-1 border border-border rounded-md px-2 py-1.5 justify-center bg-background"
              onPress={() => openPicker(JOB_TYPE_OPTIONS, jobType, setJobType)}
            >
              <Text className="text-sm text-foreground">
                {JOB_TYPE_OPTIONS.find((o) => o.value === jobType)?.label || "All Types"}
              </Text>
            </Pressable>
          </View>
          <View className="flex-row gap-2 mb-3">
            <Pressable
              className="flex-1 border border-border rounded-md px-2 py-1.5 justify-center bg-background"
              onPress={() => openPicker(REMOTE_OPTIONS, remote, setRemote)}
            >
              <Text className="text-sm text-foreground">
                {REMOTE_OPTIONS.find((o) => o.value === remote)?.label || "Any Location"}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 border border-border rounded-md px-2 py-1.5 justify-center bg-background flex-row items-center gap-1"
              onPress={() => openPicker(DATE_OPTIONS, datePosted, setDatePosted)}
            >
              <CalendarDays size={12} className="text-muted-foreground" />
              <Text className="text-sm text-foreground">
                {DATE_OPTIONS.find((o) => o.value === datePosted)?.label || "Past month"}
              </Text>
            </Pressable>
          </View>
          <Button className="w-full" onPress={searchJobs} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Search size={16} className="mr-1" />
                <Text className="text-primary-foreground">Search Jobs</Text>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.map((job, i) => (
        <Animated.View key={i} entering={FadeIn.duration(200).delay(i * 30)}>
          <Card>
            <CardContent className="p-4">
              <View className="flex-row gap-3 items-start mb-2">
                <View className="w-10 h-10 rounded bg-primary/10 items-center justify-center">
                  <Building2 size={20} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground text-sm">{job.title}</Text>
                  <Text className="text-sm text-primary">{job.company}</Text>
                </View>
                <View className="flex-col items-end gap-1">
                  <View className="px-2 py-0.5 rounded-full bg-primary/10">
                    <Text className="text-xs text-primary">{formatType(job.type)}</Text>
                  </View>
                  {job.isRemote && (
                    <View className="px-2 py-0.5 rounded-full bg-emerald-500/10 flex-row items-center gap-1">
                      <Globe size={12} className="text-emerald-600" />
                      <Text className="text-xs text-emerald-600">Remote</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text className="text-xs text-muted-foreground mb-2" numberOfLines={2}>
                {job.description}
              </Text>
              {job.highlights.length > 0 && (
                <View className="flex-row flex-wrap gap-1 mb-2">
                  {job.highlights.slice(0, 4).map((h, hi) => (
                    <View key={hi} className="px-2 py-0.5 bg-muted rounded">
                      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        {h}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <View className="flex-row items-center justify-between pt-1 border-t border-border">
                <View className="flex-row items-center gap-2 flex-wrap flex-1">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} className="text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground">{job.location}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Clock size={12} className="text-primary" />
                    <Text className="text-xs text-primary font-medium">{formatDate(job.postedDate)}</Text>
                  </View>
                  {formatSalary(job) && (
                    <View className="flex-row items-center gap-1">
                      <DollarSign size={12} className="text-emerald-600" />
                      <Text className="text-xs text-emerald-600">{formatSalary(job)}</Text>
                    </View>
                  )}
                </View>
                {job.applyUrl || job.jobUrl ? (
                  <Pressable
                    className="flex-row items-center gap-1 ml-2"
                    onPress={() => Linking.openURL((job.applyUrl || job.jobUrl)!)}
                  >
                    <Text className="text-xs text-primary font-medium">Apply</Text>
                    <ExternalLink size={12} className="text-primary" />
                  </Pressable>
                ) : null}
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      ))}

      <PickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        options={pickerOptions}
        selectedValue={pickerKey}
        onSelect={(v) => {
          if (pickerOnChange) pickerOnChange(v);
          setPickerVisible(false);
        }}
      />
    </Animated.View>
  );
}

function RealWorldWhy() {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const generateExplanation = async () => {
    if (!topic.trim()) {
      Toast.show({ type: "error", text1: "Enter a topic" });
      return;
    }
    setLoading(true);
    setExplanation("");

    try {
      const prompt = `As an inspiring educator, explain why "${topic}" matters in the real world. Structure your response as:

**Why This Matters:**
[Brief engaging intro about real-world relevance]

**Career Applications:**
- [3-4 specific careers/industries that use this]

**Everyday Impact:**
- [2-3 ways this affects daily life]

**Famous Examples:**
- [1-2 notable people or innovations related to this topic]

**Your Future:**
[Motivational closing about how mastering this opens doors]

Keep it engaging and relatable for students!`;

      await streamAIChat({
        messages: [{ role: "user", content: prompt }],
        onDelta: (chunk) => setExplanation((prev) => prev + chunk),
        onDone: () => setLoading(false),
        onError: (error) => {
          Toast.show({ type: "error", text1: error });
          setLoading(false);
        },
      });
    } catch {
      Toast.show({ type: "error", text1: "Failed to generate" });
      setLoading(false);
    }
  };

  const exampleTopics = [
    { name: "Calculus", icon: "\u{1F4D0}" },
    { name: "Shakespeare", icon: "\u{1F4DA}" },
    { name: "Chemistry", icon: "\u2697\uFE0F" },
    { name: "History", icon: "\u{1F3DB}\uFE0F" },
  ];

  return (
    <Animated.View entering={FadeIn.duration(300)} className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <Lightbulb size={24} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">Real-World "Why"</Text>
              <Text className="text-sm text-muted-foreground">
                Discover why what you're learning actually matters
              </Text>
            </View>
          </View>
          <TextInput
            className="border border-border rounded-md px-3 py-2 text-sm text-foreground bg-background mb-2"
            placeholder="Enter a topic you're studying..."
            placeholderTextColor="#94A3B8""
            value={topic}
            onChangeText={setTopic}
          />
          <View className="flex-row flex-wrap gap-2 mb-4">
            {exampleTopics.map((ex) => (
              <Pressable
                key={ex.name}
                onPress={() => setTopic(ex.name)}
                className="px-3 py-1.5 bg-muted rounded-full"
              >
                <Text className="text-xs text-muted-foreground">
                  {ex.icon} {ex.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button className="w-full" onPress={generateExplanation} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                <Text className="text-primary-foreground">Show Me Why It Matters</Text>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {explanation ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Card>
            <CardContent className="p-4">
              <Text className="text-sm text-foreground whitespace-pre-wrap">{explanation}</Text>
            </CardContent>
          </Card>
        </Animated.View>
      ) : (
        <Card>
          <CardContent className="p-4">
            <View className="flex-row flex-wrap">
              {[
                { Icon: Briefcase, label: "Career paths" },
                { Icon: Heart, label: "Life impact" },
                { Icon: Globe, label: "Global relevance" },
                { Icon: BookOpen, label: "Famous examples" },
              ].map((item) => (
                <View key={item.label} className="w-1/2 flex-row items-center gap-2 py-2">
                  <item.Icon size={18} className="text-primary" />
                  <Text className="text-sm text-muted-foreground">{item.label}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}
    </Animated.View>
  );
}

function SelectDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        className="px-2 py-1.5 border border-border rounded-md bg-background min-w-[80px]"
        onPress={() => setVisible(true)}
      >
        <Text className="text-xs text-foreground">{value}</Text>
      </Pressable>
      <PickerModal
        visible={visible}
        onClose={() => setVisible(false)}
        options={options}
        selectedValue={value}
        onSelect={(v) => {
          onChange(v);
          setVisible(false);
        }}
      />
    </>
  );
}

function PickerModal({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (v: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-card rounded-t-2xl max-h-[50%]" onPress={() => {}}>
          <View className="p-4 border-b border-border items-center">
            <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </View>
          <ScrollView>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                className={cn(
                  "px-6 py-3 border-b border-border/50 flex-row items-center justify-between",
                  selectedValue === opt.value ? "bg-primary/5" : ""
                )}
                onPress={() => onSelect(opt.value)}
              >
                <Text
                  className={cn(
                    "text-base",
                    selectedValue === opt.value ? "text-primary font-medium" : "text-foreground"
                  )}
                >
                  {opt.label}
                </Text>
                {selectedValue === opt.value && (
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-primary-foreground text-xs">✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
          <Pressable className="p-4 items-center bg-muted/30" onPress={onClose}>
            <Text className="text-foreground font-medium">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}