import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { streamAIChat } from "../../../lib/ai";
import { parseConceptMapResponse } from "../../../lib/parseAIResponse";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  depth: number;
  parentId: string | null;
  children: string[];
  expanded: boolean;
  description: string | null;
  loadingDescription: boolean;
  loadingChildren: boolean;
}

const DEPTH_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
];

const DEPTH_TEXT = [
  "text-primary-foreground",
  "text-accent-foreground",
  "text-white",
  "text-white",
  "text-white",
];

const DEPTH_BORDER = [
  "border-primary",
  "border-accent",
  "border-emerald-500",
  "border-purple-500",
  "border-orange-500",
];

const SCREEN = Dimensions.get("window");

const layoutNodes = (
  nodeMap: Map<string, MindMapNode>
): Map<string, MindMapNode> => {
  const updated = new Map(nodeMap);
  const root = Array.from(updated.values()).find((n) => n.depth === 0);
  if (!root) return updated;

  root.x = 0;
  root.y = 0;
  updated.set(root.id, root);

  const layoutChildren = (parentId: string, depth: number) => {
    const parent = updated.get(parentId);
    if (!parent) return;
    const childIds = parent.children;
    if (childIds.length === 0) return;

    const radius = 180 + depth * 140;
    const parentAngle =
      depth === 1 ? null : Math.atan2(parent.y, parent.x);
    const angleSpread =
      depth === 1
        ? 2 * Math.PI
        : Math.min(Math.PI * 0.6, childIds.length * 0.4);
    const startAngle =
      depth === 1
        ? -Math.PI / 2
        : (parentAngle ?? 0) - angleSpread / 2;

    childIds.forEach((cid, i) => {
      const child = updated.get(cid);
      if (!child) return;
      const angleStep =
        childIds.length === 1 ? 0 : angleSpread / (childIds.length - 1);
      const angle = startAngle + i * angleStep;
      child.x = parent.x + radius * Math.cos(angle);
      child.y = parent.y + radius * Math.sin(angle);
      updated.set(cid, child);
      layoutChildren(cid, depth + 1);
    });
  };

  const rootChildren = root.children;
  if (rootChildren.length > 0) {
    const angleStep = (2 * Math.PI) / rootChildren.length;
    rootChildren.forEach((cid, i) => {
      const child = updated.get(cid);
      if (!child) return;
      const angle = -Math.PI / 2 + i * angleStep;
      const radius = 200;
      child.x = radius * Math.cos(angle);
      child.y = radius * Math.sin(angle);
      updated.set(cid, child);
      layoutChildren(cid, 2);
    });
  }

  return updated;
};

const getNodeSize = (depth: number) => {
  if (depth === 0) return { w: 150, h: 48 };
  if (depth === 1) return { w: 120, h: 38 };
  return { w: 100, h: 34 };
};

export default function ConceptLinkingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notes, setNotes] = useState<{ id: string; title: string }[]>([]);
  const [nodes, setNodes] = useState<Map<string, MindMapNode>>(new Map());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
  const panRef = useRef({ x: 0, y: 0, scale: 0.8, isPanning: false, startX: 0, startY: 0 });

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("id, title")
      .eq("user_id", user?.id || "")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotes(data || []);
    setNotesLoading(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        panRef.current.isPanning = true;
        panRef.current.startX = e.nativeEvent.pageX - panRef.current.x;
        panRef.current.startY = e.nativeEvent.pageY - panRef.current.y;
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        if (!panRef.current.isPanning) return;
        const newX = e.nativeEvent.pageX - panRef.current.startX;
        const newY = e.nativeEvent.pageY - panRef.current.startY;
        panRef.current.x = newX;
        panRef.current.y = newY;
        setTransform((prev) => ({ ...prev, x: newX, y: newY }));
      },
      onPanResponderRelease: () => {
        panRef.current.isPanning = false;
      },
    })
  ).current;

  const generateMindMap = async (noteId: string) => {
    setGenerating(true);
    setNodes(new Map());

    try {
      const { data: note } = await supabase
        .from("notes")
        .select("content")
        .eq("id", noteId)
        .single();
      if (!note?.content) throw new Error("No content");

      let fullResponse = "";
      await streamAIChat({
        messages: [],
        mode: "concept_map",
        content: note.content.substring(0, 4000),
        onDelta: (chunk) => {
          fullResponse += chunk;
        },
        onDone: () => {
          try {
            const data = parseConceptMapResponse(fullResponse);
            const nodeMap = new Map<string, MindMapNode>();

            data.nodes.forEach((n, i) => {
              nodeMap.set(n.id, {
                id: n.id,
                label: n.label,
                x: 0,
                y: 0,
                depth: i === 0 ? 0 : 1,
                parentId: i === 0 ? null : data.nodes[0].id,
                children: [],
                expanded: false,
                description: null,
                loadingDescription: false,
                loadingChildren: false,
              });
            });

            data.connections.forEach((c) => {
              const parent = nodeMap.get(c.from);
              if (parent && nodeMap.has(c.to)) {
                parent.children.push(c.to);
                const child = nodeMap.get(c.to)!;
                child.parentId = c.from;
                const parentNode = nodeMap.get(c.from);
                if (parentNode) child.depth = parentNode.depth + 1;
              }
            });

            if (data.connections.length === 0 && data.nodes.length > 1) {
              const root = nodeMap.get(data.nodes[0].id)!;
              data.nodes.slice(1).forEach((n) => {
                root.children.push(n.id);
                const child = nodeMap.get(n.id)!;
                child.parentId = root.id;
                child.depth = 1;
              });
            }

            const laid = layoutNodes(nodeMap);
            setNodes(laid);
            setTransform({ x: 0, y: 0, scale: 0.8 });
            panRef.current = { x: 0, y: 0, scale: 0.8, isPanning: false, startX: 0, startY: 0 };
          } catch (e) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to parse mind map. Please try again.",
            });
          }
          setGenerating(false);
        },
        onError: (err) => {
          Toast.show({ type: "error", text1: "Error", text2: err });
          setGenerating(false);
        },
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to generate mind map",
      });
      setGenerating(false);
    }
  };

  const handleNodeClick = async (nodeId: string) => {
    const node = nodes.get(nodeId);
    if (!node) return;

    if (node.expanded) {
      setNodes((prev) => {
        const updated = new Map(prev);
        const n = { ...updated.get(nodeId)! };
        n.expanded = false;
        updated.set(nodeId, n);
        return updated;
      });
      return;
    }

    if (!node.description) {
      setNodes((prev) => {
        const updated = new Map(prev);
        const n = { ...updated.get(nodeId)! };
        n.loadingDescription = true;
        n.expanded = true;
        updated.set(nodeId, n);
        return updated;
      });

      let desc = "";
      await streamAIChat({
        messages: [],
        mode: "socratic",
        content: `Explain the concept "${node.label}" in 2-3 short sentences for a student. Be clear and concise.`,
        onDelta: (chunk) => {
          desc += chunk;
        },
        onDone: () => {
          setNodes((prev) => {
            const updated = new Map(prev);
            const n = { ...updated.get(nodeId)! };
            n.description = desc;
            n.loadingDescription = false;
            updated.set(nodeId, n);
            return updated;
          });
        },
        onError: () => {
          setNodes((prev) => {
            const updated = new Map(prev);
            const n = { ...updated.get(nodeId)! };
            n.loadingDescription = false;
            n.description = "Could not load explanation.";
            updated.set(nodeId, n);
            return updated;
          });
        },
      });
    } else {
      setNodes((prev) => {
        const updated = new Map(prev);
        const n = { ...updated.get(nodeId)! };
        n.expanded = true;
        updated.set(nodeId, n);
        return updated;
      });
    }
  };

  const expandNode = async (nodeId: string) => {
    const node = nodes.get(nodeId);
    if (!node || node.loadingChildren) return;

    setNodes((prev) => {
      const updated = new Map(prev);
      const n = { ...updated.get(nodeId)! };
      n.loadingChildren = true;
      updated.set(nodeId, n);
      return updated;
    });

    let response = "";
    await streamAIChat({
      messages: [],
      mode: "concept_map",
      content: `Generate 2-3 sub-concepts for the concept "${node.label}". Return as JSON with nodes and connections arrays. Each node has id and label. Connections have from and to fields. The parent node id is "${node.id}".`,
      onDelta: (chunk) => {
        response += chunk;
      },
      onDone: () => {
        try {
          const data = parseConceptMapResponse(response);
          setNodes((prev) => {
            const updated = new Map(prev);
            const parent = { ...updated.get(nodeId)! };
            parent.loadingChildren = false;

            const newChildIds: string[] = [];
            data.nodes.forEach((n) => {
              if (n.id === nodeId) return;
              const newId = `${nodeId}_${n.id}`;
              newChildIds.push(newId);
              updated.set(newId, {
                id: newId,
                label: n.label,
                x: parent.x,
                y: parent.y,
                depth: parent.depth + 1,
                parentId: nodeId,
                children: [],
                expanded: false,
                description: null,
                loadingDescription: false,
                loadingChildren: false,
              });
            });

            parent.children = [...parent.children, ...newChildIds];
            updated.set(nodeId, parent);
            return layoutNodes(updated);
          });
        } catch {
          setNodes((prev) => {
            const updated = new Map(prev);
            const n = { ...updated.get(nodeId)! };
            n.loadingChildren = false;
            updated.set(nodeId, n);
            return updated;
          });
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to expand concept",
          });
        }
      },
      onError: () => {
        setNodes((prev) => {
          const updated = new Map(prev);
          const n = { ...updated.get(nodeId)! };
          n.loadingChildren = false;
          updated.set(nodeId, n);
          return updated;
        });
      },
    });
  };

  const nodesArray = Array.from(nodes.values());

  const connections: { from: MindMapNode; to: MindMapNode }[] = [];
  nodesArray.forEach((node) => {
    node.children.forEach((childId) => {
      const child = nodes.get(childId);
      if (child) connections.push({ from: node, to: child });
    });
  });

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 0.8 });
    panRef.current = { x: 0, y: 0, scale: 0.8, isPanning: false, startX: 0, startY: 0 };
  };

  const zoomIn = () => {
    const newScale = Math.min(3, transform.scale + 0.2);
    setTransform((prev) => ({ ...prev, scale: newScale }));
    panRef.current.scale = newScale;
  };

  const zoomOut = () => {
    const newScale = Math.max(0.2, transform.scale - 0.2);
    setTransform((prev) => ({ ...prev, scale: newScale }));
    panRef.current.scale = newScale;
  };

  if (generating) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary mb-4" />
        <Text className="text-muted-foreground">Generating mind map...</Text>
      </View>
    );
  }

  if (nodes.size === 0) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Mind Map
              </Text>
              <Text className="text-sm text-muted-foreground">
                Interactive concept maps
              </Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <Network size={20} className="text-primary" />
            </View>
          </View>

          <Text className="text-sm font-medium text-muted-foreground">
            Select a note to map:
          </Text>
          {notesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" className="text-primary" />
            </View>
          ) : notes.length === 0 ? (
            <Text className="text-center text-muted-foreground py-8">
              No notes yet. Create notes first!
            </Text>
          ) : (
            notes.map((note) => (
              <Pressable key={note.id} onPress={() => generateMindMap(note.id)}>
                <Card>
                  <CardContent className="p-4">
                    <Text className="font-medium text-foreground">
                      {note.title}
                    </Text>
                  </CardContent>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  const centerX = SCREEN.width / 2;
  const centerY = SCREEN.height / 2 - 60;

  return (
    <View className="flex-1 bg-background">
      <View className="p-3 border-b border-border flex-row items-center gap-2">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Mind Map</Text>
        </View>
        <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
          <Network size={16} className="text-primary" />
        </View>
      </View>

      <View
        className="flex-1 bg-muted/30 relative overflow-hidden"
        {...panResponder.panHandlers}
      >
        <View
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: [
              { translateX: transform.x },
              { translateY: transform.y },
              { scale: transform.scale },
            ],
          }}
        >
          {connections.map(({ from, to }) => {
            const fromSize = getNodeSize(from.depth);
            const toSize = getNodeSize(to.depth);
            const x1 = from.x + fromSize.w / 2;
            const y1 = from.y + fromSize.h / 2;
            const x2 = to.x + toSize.w / 2;
            const y2 = to.y + toSize.h / 2;
            const colorIdx = Math.min(to.depth, DEPTH_BORDER.length - 1);
            const dashArray = to.depth >= 3 ? "6 4" : "none";

            return (
              <View
                key={`${from.id}-${to.id}`}
                style={{
                  position: "absolute",
                  left: Math.min(x1, x2) - 10,
                  top: Math.min(y1, y2) - 10,
                  width: Math.abs(x2 - x1) + 20,
                  height: Math.abs(y2 - y1) + 20,
                  borderColor: "transparent",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: x1 - Math.min(x1, x2) + 10,
                    top: y1 - Math.min(y1, y2) + 10,
                    width: 2,
                    height: Math.sqrt(
                      Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
                    ),
                    backgroundColor: colorIdx === 0 ? "hsl(262, 83%, 58%)" : colorIdx === 1 ? "hsl(210, 20%, 60%)" : colorIdx === 2 ? "#10b981" : colorIdx === 3 ? "#a855f7" : "#f97316",
                    opacity: 0.4,
                    transform: [
                      {
                        rotate: `${Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)}deg`,
                      },
                    ],
                    transformOrigin: "top left",
                  }}
                />
              </View>
            );
          })}

          {nodesArray.map((node) => {
            const size = getNodeSize(node.depth);
            const colorIdx = Math.min(node.depth, DEPTH_COLORS.length - 1);
            const fontSize =
              node.depth === 0
                ? "text-sm font-bold"
                : node.depth === 1
                ? "text-xs font-semibold"
                : "text-[11px] font-medium";

            return (
              <View
                key={node.id}
                style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y,
                  width: size.w,
                  zIndex: node.expanded ? 20 : 10,
                }}
              >
                <Pressable onPress={() => handleNodeClick(node.id)}>
                  <View
                    className={`rounded-xl px-3 py-2 items-center justify-center shadow-md ${DEPTH_COLORS[colorIdx]} ${fontSize} ${DEPTH_TEXT[colorIdx]}`}
                    style={{ minHeight: size.h }}
                  >
                    <View className="flex-row items-center gap-1">
                      <Text
                        className={`${DEPTH_TEXT[colorIdx]} ${fontSize}`}
                        numberOfLines={1}
                      >
                        {node.label}
                      </Text>
                      {node.expanded ? (
                        <ChevronUp size={12} className="text-current" />
                      ) : (
                        <ChevronDown size={12} className="text-current" />
                      )}
                    </View>
                  </View>
                </Pressable>

                {node.expanded && (
                  <View
                    className="mt-1 p-3 rounded-xl bg-card border border-border shadow-lg"
                    style={{ width: Math.max(size.w, 200), minWidth: 180 }}
                  >
                    {node.loadingDescription ? (
                      <View className="flex-row items-center gap-2">
                        <ActivityIndicator size="small" className="text-primary" />
                        <Text className="text-xs text-muted-foreground">
                          Loading...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-xs text-foreground leading-relaxed">
                        {node.description}
                      </Text>
                    )}

                    <Pressable
                      onPress={() => expandNode(node.id)}
                      disabled={node.loadingChildren}
                      className="mt-2 p-2 rounded-lg bg-muted items-center flex-row justify-center gap-1"
                    >
                      {node.loadingChildren ? (
                        <ActivityIndicator size="small" className="text-primary" />
                      ) : (
                        <Plus size={12} className="text-foreground" />
                      )}
                      <Text className="text-xs text-foreground">
                        Expand sub-concepts
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View className="absolute bottom-4 right-4 flex-col gap-2 z-30">
          <Pressable
            onPress={zoomIn}
            className="w-9 h-9 rounded-lg bg-card border border-border items-center justify-center shadow-md"
          >
            <ZoomIn size={16} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={zoomOut}
            className="w-9 h-9 rounded-lg bg-card border border-border items-center justify-center shadow-md"
          >
            <ZoomOut size={16} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={resetView}
            className="w-9 h-9 rounded-lg bg-card border border-border items-center justify-center shadow-md"
          >
            <Maximize size={16} className="text-foreground" />
          </Pressable>
        </View>

        <View className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-card/80 border border-border z-30">
          <Text className="text-xs text-muted-foreground">
            {Math.round(transform.scale * 100)}%
          </Text>
        </View>
      </View>

      <View className="p-3 border-t border-border flex-row gap-2">
        <Button
          onPress={() => {
            setNodes(new Map());
            setTransform({ x: 0, y: 0, scale: 1 });
          }}
          variant="outline"
          className="flex-1"
        >
          <Text className="text-foreground">New Mind Map</Text>
        </Button>
        <Text className="text-xs text-muted-foreground self-center px-2">
          {nodesArray.length} concepts
        </Text>
      </View>
    </View>
  );
}
