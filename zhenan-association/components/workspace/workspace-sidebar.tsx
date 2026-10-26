"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { workspaceNavigation } from "../../modules/workspace/navigation";
import {
  createDefaultExpandedGroups,
  toggleNavigationGroup,
} from "../../modules/workspace/navigation-state";

const STORAGE_KEY = "zhenan-workspace-expanded-groups";

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    createDefaultExpandedGroups,
  );
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExpandedGroups(new Set(parsed.filter((value): value is string => typeof value === "string")));
        }
      }
    } catch {
      // A blocked sessionStorage should not prevent navigation.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedGroups]));
    } catch {
      // A blocked sessionStorage should not prevent navigation.
    }
  }, [expandedGroups, storageReady]);

  function toggleGroup(label: string) {
    setExpandedGroups((current) => toggleNavigationGroup(current, label));
  }

  return (
    <aside className="sidebar">
      <Link className="brand" href="/workspace" aria-label="返回工作台">
        <span className="brand-mark">Z</span>
        <span>
          <strong>镇安县生态产业协会</strong>
          <small>管理中台</small>
        </span>
      </Link>

      <nav className="side-nav" aria-label="业务导航">
        <Link className={`side-nav-home ${pathname === "/workspace" ? "active" : ""}`} href="/workspace">
          <span className="nav-icon">总</span>
          <span>工作台总览</span>
        </Link>
        {workspaceNavigation.map((group, index) => {
          const expanded = expandedGroups.has(group.label);
          const groupId = `nav-group-${index}`;
          return (
            <section className={`nav-group ${expanded ? "expanded" : ""}`} key={group.label}>
              <button
                className="nav-group-toggle"
                type="button"
                aria-controls={groupId}
                aria-expanded={expanded}
                onClick={() => toggleGroup(group.label)}
              >
                <span className="nav-group-label">
                  <span className="nav-icon muted">{group.shortLabel}</span>
                  <span>{group.label}</span>
                </span>
                <span className="nav-group-chevron" aria-hidden="true">⌄</span>
              </button>
              <div className="nav-group-items" id={groupId}>
                {group.items.map((item) => (
                  <Link
                    className={`nav-item ${pathname === item.route ? "active" : ""}`}
                    href={item.route}
                    key={item.route}
                    aria-current={pathname === item.route ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {item.wave !== "W1" && <span className="wave-tag">{item.wave}</span>}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span className="status-dot" />
        <span>测试环境</span>
        <span className="tenant-name">轻立方租户</span>
      </div>
    </aside>
  );
}
