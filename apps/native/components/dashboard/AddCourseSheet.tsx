import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Plus } from "lucide-react-native";
import { Sheet } from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const COURSE_COLORS = [
  "#8B5CF6",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

const COURSE_ICONS = [
  "📚", "📐", "🔬", "🧬", "💻", "🎨", "🎵", "🌍",
  "📊", "🧮", "✏️", "📝", "🔢", "🌐", "🧪", "⚡",
];

interface AddCourseSheetProps {
  onAdd: (name: string, color: string, icon: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCourseSheet({ onAdd, open, onOpenChange }: AddCourseSheetProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COURSE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(COURSE_ICONS[0]);

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), selectedColor, selectedIcon);
      setName("");
      setSelectedColor(COURSE_COLORS[0]);
      setSelectedIcon(COURSE_ICONS[0]);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={["70%"]}>
      <View className="gap-6">
        <View>
          <Text className="text-xl font-bold text-foreground">Add New Course</Text>
        </View>

        <View>
          <Label>Course Name</Label>
          <TextInput
            placeholder="e.g., Computer Science 101"
            value={name}
            onChangeText={setName}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground mt-1.5"
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
        </View>

        <View>
          <Label>Choose Icon</Label>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {COURSE_ICONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-10 h-10 rounded-lg items-center justify-center ${
                  selectedIcon === icon
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                <Text className="text-xl">{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Label>Choose Color</Label>
          <View className="flex-row gap-2 mt-2">
            {COURSE_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${
                  selectedColor === color ? "border-2 border-foreground" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
        </View>

        <View className="p-4 rounded-xl bg-muted/50">
          <Text className="text-xs text-muted-foreground mb-2">Preview</Text>
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <Text className="text-xl">{selectedIcon}</Text>
            </View>
            <Text className="font-semibold text-foreground">
              {name || "Course Name"}
            </Text>
          </View>
        </View>

        <Button
          onPress={handleSubmit}
          disabled={!name.trim()}
          className="w-full bg-primary"
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
          <Text className="text-primary-foreground font-semibold">Add Course</Text>
        </Button>
      </View>
    </Sheet>
  );
}
