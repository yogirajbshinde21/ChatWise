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

import { useEffect, useState } from "react";
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
    } = useGroupStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryGroup, setSummaryGroup] = useState(null);
    const [summaryMode, setSummaryMode] = useState("previousDay");
    const [summary, setSummary] = useState(null);
    const [newGroupData, setNewGroupData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        getUserGroups();
    }, [getUserGroups]);

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

    const handleViewSummary = async (group) => {
        setSummaryGroup(group);
        setShowSummaryModal(true);
        
        try {
            const summaryData = await getGroupSummary(group._id, summaryMode);
            setSummary(summaryData);
        } catch {
            // Error handled in store
        }
    };

    const handleSummaryModeChange = async (mode) => {
        setSummaryMode(mode);
        if (summaryGroup) {
            try {
                const summaryData = await getGroupSummary(summaryGroup._id, mode);
                setSummary(summaryData);
            } catch {
                // Error handled in store
            }
        }
    };

    if (isGroupsLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="border-b border-base-300 w-full p-5">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <h2 className="font-semibold">Groups</h2>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto w-full py-3">
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
            <div className="border-b border-base-300 w-full p-5">
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
            <div className="flex-1 overflow-y-auto w-full py-3">
                {groups.length === 0 ? (
                    <div className="text-center p-6">
                        <Users className="w-16 h-16 mx-auto mb-4 text-base-content/50" />
                        <h3 className="font-semibold text-lg mb-2">No Groups Yet</h3>
                        <p className="text-base-content/60 mb-4">
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
                    <div className="space-y-2 px-3">
                        {groups.map((group) => (
                            <div
                                key={group._id}
                                className={`group relative w-full p-3 rounded-lg transition-all cursor-pointer hover:bg-base-200 ${
                                    selectedGroup?._id === group._id ? "bg-base-200" : ""
                                }`}
                                onClick={() => setSelectedGroup(group)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="w-6 h-6 text-primary" />
                                            </div>
                                            {group.admin._id === authUser._id && (
                                                <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                                            )}
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-sm truncate">
                                                {group.name}
                                            </h3>
                                            <p className="text-xs text-base-content/70 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {group.members.length} members
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewSummary(group);
                                            }}
                                            className="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="View Summary"
                                        >
                                            📄 Summary
                                        </button>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedGroup(group);
                                            }}
                                            className="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <h3 className="font-bold text-lg mb-4">Create New Group</h3>
                        
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Group Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
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
                                    className="textarea textarea-bordered w-full"
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
                    <div className="modal-box max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Group Summary</h3>
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
                        
                        {summaryGroup && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-base mb-2">{summaryGroup.name}</h4>
                                
                                <div className="tabs tabs-boxed mb-4">
                                    <button
                                        className={`tab ${summaryMode === "previousDay" ? "tab-active" : ""}`}
                                        onClick={() => handleSummaryModeChange("previousDay")}
                                    >
                                        Previous Day
                                    </button>
                                    <button
                                        className={`tab ${summaryMode === "sinceLastSeen" ? "tab-active" : ""}`}
                                        onClick={() => handleSummaryModeChange("sinceLastSeen")}
                                    >
                                        Since Last Seen
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-base-200 rounded-lg p-4">
                            {isGeneratingSummary ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="loading loading-spinner loading-lg"></div>
                                    <span className="ml-2">Generating summary...</span>
                                </div>
                            ) : summary ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-base-content/70">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{summary.messageCount} messages • {summary.period}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{summary.summary}</p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-base-content/60">
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
