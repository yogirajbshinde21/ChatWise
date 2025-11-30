/**
 * GROUP LIST COMPONENT - Displays user's groups with management options
 * 
 * This component provides:
 * - List of user's groups
 * - Create new group functionality
 * - Group selection for chatting
 * - "View Summary" button for each group
 * - Real-time updates for group changes
 * 
 * Key Features:
 * - Mobile-responsive design with Tailwind CSS
 * - Modal for creating new groups
 * - Loading states and error handling
 * - Group member count display
 * - Admin indicators
 */

import { useEffect, useState, useCallback } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Plus, Crown, MessageCircle, TrendingUp, X } from "lucide-react";
import toast from "react-hot-toast";

const GroupList = () => {
    const { authUser } = useAuthStore();
    const {
        groups,
        isGroupsLoading,
        getUserGroups,
        createGroup,
        setSelectedGroup,
        selectedGroup,
        getGroupSummary,
        isGeneratingSummary,
        markSummaryAsRead,
        lastSummaryUpdate,
    } = useGroupStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryGroup, setSummaryGroup] = useState(null);
    const [summaryMode, setSummaryMode] = useState("unseenMessages");
    const [summary, setSummary] = useState(null);
    const [newGroupData, setNewGroupData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        getUserGroups();
    }, [getUserGroups]);

    // Watch for summary updates and refresh if modal is open for the same group
    useEffect(() => {
        if (lastSummaryUpdate > 0 && showSummaryModal && summaryGroup) {
            console.log("🔄 Summary update detected, refreshing summary for group:", summaryGroup.name);
            handleViewSummary(summaryGroup);
        }
    }, [lastSummaryUpdate, showSummaryModal, summaryGroup]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        
        if (!newGroupData.name.trim()) {
            toast.error("Group name is required");
            return;
        }

        try {
            await createGroup(newGroupData);
            setNewGroupData({ name: "", description: "" });
            setShowCreateModal(false);
        } catch {
            // Error handled in store
        }
    };

    const handleViewSummary = useCallback(async (group) => {
        setSummaryGroup(group);
        setShowSummaryModal(true);
        
        try {
            // The new API returns all three categories in one call
            const summaryData = await getGroupSummary(group._id);
            setSummary(summaryData);
        } catch {
            // Error handled in store
        }
    }, [getGroupSummary]);

    const handleSummaryModeChange = async (mode) => {
        // Mode switching is now handled within the summary data
        // No need to make separate API calls for different modes
        setSummaryMode(mode);
    };

    // Get the current mode's summary data
    const getCurrentSummaryData = () => {
        if (!summary || !summary.summaries) return null;
        
        const currentSummary = summary.summaries[summaryMode];
        const currentCount = summary.counts[summaryMode];
        
        if (!currentSummary) return null;
        
        return {
            summary: currentSummary.text,
            messageCount: currentCount,
            period: summaryMode,
            summaryCount: 1,
            isFromHistory: currentSummary.isFromCache || false,
            generatedAt: currentSummary.generatedAt
        };
    };

    if (isGroupsLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="w-full p-5 border-b border-base-300">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <h2 className="font-semibold">Groups</h2>
                    </div>
                </div>
                <div className="flex-1 w-full py-3 overflow-y-auto">
                    <div className="flex items-center justify-center h-full">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="w-full p-5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <h2 className="font-semibold">Groups</h2>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-sm btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 w-full py-3 overflow-y-auto">
                {groups.length === 0 ? (
                    <div className="p-6 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-base-content/50" />
                        <h3 className="mb-2 text-lg font-semibold">No Groups Yet</h3>
                        <p className="mb-4 text-base-content/60">
                            Create your first group to start chatting with multiple people
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Create Group
                        </button>
                    </div>
                ) : (
                    <div className="px-3 space-y-2">
                        {groups.map((group) => (
                            <div
                                key={group._id}
                                className={`group relative w-full p-3 rounded-lg transition-all cursor-pointer hover:bg-base-200 ${
                                    selectedGroup?._id === group._id ? "bg-base-200" : ""
                                }`}
                                onClick={() => setSelectedGroup(group)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-3">
                                        <div className="relative">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                                <Users className="w-6 h-6 text-primary" />
                                            </div>
                                            {group.admin._id === authUser._id && (
                                                <Crown className="absolute w-4 h-4 text-yellow-500 -top-1 -right-1" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold truncate">
                                                {group.name}
                                            </h3>
                                            <p className="flex items-center gap-1 text-xs text-base-content/70">
                                                <Users className="w-3 h-3" />
                                                {group.members.length} members
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewSummary(group);
                                            }}
                                            className="btn btn-xs btn-ghost opacity-100 transition-opacity"
                                            title="View Summary"
                                        >
                                            📄
                                        </button>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedGroup(group);
                                            }}
                                            className="btn btn-xs btn-ghost opacity-100 transition-opacity"
                                            title="Open Chat"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="mb-4 text-lg font-bold">Create New Group</h3>
                        
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Group Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full input input-bordered"
                                    placeholder="Enter group name"
                                    value={newGroupData.name}
                                    onChange={(e) => setNewGroupData({
                                        ...newGroupData,
                                        name: e.target.value
                                    })}
                                />
                            </div>
                            
                            <div>
                                <label className="label">
                                    <span className="label-text">Description (Optional)</span>
                                </label>
                                <textarea
                                    className="w-full textarea textarea-bordered"
                                    placeholder="Enter group description"
                                    value={newGroupData.description}
                                    onChange={(e) => setNewGroupData({
                                        ...newGroupData,
                                        description: e.target.value
                                    })}
                                />
                            </div>
                            
                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="modal modal-open">
                    <div className="max-w-2xl modal-box">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Group Summary</h3>
                            <div className="flex items-center gap-2">
                                {summary && summaryMode === "unseenMessages" && summary.counts?.unseenMessages > 0 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await markSummaryAsRead(summaryGroup._id);
                                                setShowSummaryModal(false);
                                                setSummary(null);
                                                toast.success("Summary marked as read");
                                            } catch {
                                                // Error already handled in store
                                            }
                                        }}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowSummaryModal(false);
                                        setSummary(null);
                                    }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        {summaryGroup && (
                            <div className="mb-4">
                                <h4 className="mb-2 text-base font-semibold">{summaryGroup.name}</h4>
                                
                                <div className="mb-4 tabs tabs-boxed">
                                    <button
                                        className={`tab ${summaryMode === "unseenMessages" ? "tab-active" : ""}`}
                                        onClick={() => handleSummaryModeChange("unseenMessages")}
                                    >
                                        Unseen Messages
                                        {summary?.counts?.[summaryMode] && (
                                            <span className="ml-2 badge badge-primary badge-sm">
                                                {summary.counts[summaryMode]}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className={`tab ${summaryMode === "seenMessages" ? "tab-active" : ""}`}
                                        onClick={() => handleSummaryModeChange("seenMessages")}
                                    >
                                        Seen Messages
                                        {summary?.counts?.[summaryMode] && (
                                            <span className="ml-2 badge badge-secondary badge-sm">
                                                {summary.counts[summaryMode]}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className={`tab ${summaryMode === "previousDay" ? "tab-active" : ""}`}
                                        onClick={() => handleSummaryModeChange("previousDay")}
                                    >
                                        Previous Day
                                        {summary?.counts?.[summaryMode] && (
                                            <span className="ml-2 badge badge-accent badge-sm">
                                                {summary.counts[summaryMode]}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-4 rounded-lg bg-base-200">
                            {isGeneratingSummary ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="loading loading-spinner loading-lg"></div>
                                    <span className="ml-2">Generating summary...</span>
                                </div>
                            ) : summary ? (
                                <div>
                                    {(() => {
                                        const currentSummaryData = getCurrentSummaryData();
                                        if (!currentSummaryData) {
                                            return (
                                                <div className="py-8 text-center text-base-content/60">
                                                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                                                    <p>No {summaryMode.replace(/([A-Z])/g, ' $1').toLowerCase()} available</p>
                                                </div>
                                            );
                                        }
                                        
                                        return (
                                            <>
                                                <div className="flex items-center gap-2 mb-3 text-sm text-base-content/70">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>
                                                        {currentSummaryData.messageCount} messages • {currentSummaryData.period.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                        {currentSummaryData.summaryCount > 1 && (
                                                            <span className="ml-2 badge badge-primary badge-sm">
                                                                {currentSummaryData.summaryCount} updates
                                                            </span>
                                                        )}
                                                        {currentSummaryData.isFromHistory && (
                                                            <span className="ml-2 badge badge-secondary badge-sm">
                                                                From cache
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-sm leading-relaxed">
                                                    <div className="whitespace-pre-wrap">{currentSummaryData.summary}</div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-base-content/60">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                                    <p>Click on a mode to generate summary</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupList;
