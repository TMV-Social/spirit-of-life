import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  HomeIcon,
} from "@sanity/icons";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import type React from "react";
import { useCallback, useState } from "react";

import type { TreeNode } from "../hooks/use-pages-tree";
import { TreeActionMenu } from "./tree-action-menu";

type TreeItemProps = {
  node: TreeNode;
  depth: number;
  onPageSelect: (pageId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (path: string) => void;
  children?: React.ReactNode;
  // Action handlers
  onCreateChild?: (parentSlug: string) => void;
  onOpenInPane?: (pageId: string) => void;
  onDuplicate?: (pageId: string) => void;
  onDelete?: (pageId: string) => void;
};

export const TreeItem: React.FC<TreeItemProps> = ({
  node,
  depth,
  onPageSelect,
  isExpanded,
  onToggleExpand,
  children,
  onCreateChild,
  onOpenInPane,
  onDuplicate,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.hasChildren || Object.keys(node.children).length > 0;

  const handleClick = useCallback(() => {
    if (node.type === "page" && node._id) {
      onPageSelect(node._id);
    } else if (hasChildren) {
      onToggleExpand(node.slug);
    }
  }, [node, onPageSelect, onToggleExpand, hasChildren]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggleExpand(node.slug);
      }
    },
    [hasChildren, onToggleExpand, node.slug]
  );

  const _handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      } else if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
        e.preventDefault();
        onToggleExpand(node.slug);
      } else if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
        e.preventDefault();
        onToggleExpand(node.slug);
      }
    },
    [handleClick, hasChildren, isExpanded, onToggleExpand, node.slug]
  );

  const getIcon = () => {
    if (node.type === "folder") {
      return <FolderIcon style={{ width: 16, height: 16 }} />;
    }
    if (node.slug === "/") {
      return <HomeIcon style={{ width: 16, height: 16 }} />;
    }
    return <DocumentIcon style={{ width: 16, height: 16 }} />;
  };

  const getAriaLabel = () => {
    if (node.type === "folder") {
      return `${node.title} folder, ${isExpanded ? "expanded" : "collapsed"}`;
    }
    return `${node.title} page, ${node.slug}`;
  };

  return (
    <Stack space={1}>
      <Card
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={getAriaLabel()}
        data-tree-item
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        padding={2}
        radius={2}
        role={node.type === "folder" ? "button" : "link"}
        style={{
          marginLeft: `${depth * 16}px`,
          // cursor: "pointer",
          borderLeft: depth > 0 ? "1px solid var(--card-border-color)" : "none",
          position: "relative",
          transition: "all 0.15s ease-in-out",
          ...(isHovered && {
            backgroundColor: "var(--card-bg-color)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }),
        }}
        tabIndex={0}
        tone={node.type === "page" ? "default" : "transparent"}
      >
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" flex={1} gap={2}>
            {hasChildren ? (
              <Box
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.title}`}
                onClick={handleToggle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggle(e as any);
                  }
                }}
                role="button"
                style={{ cursor: "pointer" }}
                tabIndex={-1}
              >
                {isExpanded ? (
                  <ChevronDownIcon style={{ width: 12, height: 12 }} />
                ) : (
                  <ChevronRightIcon style={{ width: 12, height: 12 }} />
                )}
              </Box>
            ) : (
              <Box style={{ width: 12, height: 12 }} />
            )}

            <Box>{getIcon()}</Box>

            <Text
              size={1}
              weight={node.type === "folder" ? "medium" : "regular"}
            >
              {node.title}
            </Text>

            {node.type === "page" && (
              <Text muted size={0}>
                {node.slug}
              </Text>
            )}
          </Flex>

          <Flex
            align="center"
            gap={1}
            style={{
              opacity: isHovered ? 1 : 0.3,
              transition: "opacity 0.2s ease-in-out",
              pointerEvents: "auto",
              backgroundColor: isHovered ? "rgba(0,0,0,0.05)" : "transparent",
            }}
          >
            {/* <TreeQuickActions
               node={node}
               onCreateChild={onCreateChild}
               onOpenInPane={onOpenInPane}
             /> */}

            <TreeActionMenu
              node={node}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onOpenInPane={onOpenInPane}
            />
          </Flex>
        </Flex>
      </Card>
      {isExpanded && hasChildren && children && (
        <Box aria-label={`${node.title} contents`} role="group">
          {children}
        </Box>
      )}
    </Stack>
  );
};
