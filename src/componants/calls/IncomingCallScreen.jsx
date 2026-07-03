import React, { useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Paper,
    IconButton,
    CircularProgress,
} from "@mui/material";
import {
    Phone,
    CallEnd,
    Videocam,
    VideocamOff,
    VolumeUp,
    VolumeOff,
} from "@mui/icons-material";

const IncomingCallScreen = ({
    callData,
    onAccept,
    onReject,
    onHangup,
    isRinging = true,
}) => {
    const callerName = callData?.callerName || "Unknown Caller";
    const callerRole = callData?.callerRole || "Physician";
    const hasVideo = callData?.hasVideo !== false;
    const darkMode = false;

    // Auto-dismiss ringing after 30 seconds
    useEffect(() => {
        if (!isRinging) return;
        const timer = setTimeout(() => {
            onReject?.({
                callId: callData?.callId,
                roomId: callData?.roomId,
                rejectedBy: callData?.toUserId,
                fromUserId: callData?.fromUserId,
            });
        }, 30000);

        return () => clearTimeout(timer);
    }, [isRinging, callData, onReject]);

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: "rgba(0, 0, 0, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <Paper
                elevation={24}
                sx={{
                    width: { xs: "92%", sm: 400, md: 450 },
                    p: { xs: 3, sm: 4 },
                    borderRadius: "24px",
                    background: "#1A2A4A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                    position: "relative",
                    maxHeight: "90vh",
                    overflow: "auto",
                }}
            >
                {/* Ringing animation */}
                {isRinging && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: -3,
                            left: -3,
                            right: -3,
                            bottom: -3,
                            borderRadius: "27px",
                            border: "3px solid #015DFF",
                            animation: "pulse 1.5s ease-in-out infinite",
                            pointerEvents: "none",
                            "@keyframes pulse": {
                                "0%": { opacity: 0.3, transform: "scale(1)" },
                                "50%": { opacity: 1, transform: "scale(1.02)" },
                                "100%": { opacity: 0.3, transform: "scale(1)" },
                            },
                        }}
                    />
                )}

                {/* Avatar */}
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            background: "#015DFF",
                            fontSize: 40,
                            border: "4px solid #015DFF",
                            boxShadow: "0 8px 32px rgba(1,93,255,0.3)",
                        }}
                    >
                        {callerName.charAt(0).toUpperCase()}
                    </Avatar>
                    {isRinging && (
                        <CircularProgress
                            size={116}
                            thickness={2}
                            sx={{
                                position: "absolute",
                                top: -8,
                                left: -8,
                                color: "#015DFF",
                            }}
                        />
                    )}
                </Box>

                {/* Caller Info */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "#F8FAFC",
                        mb: 0.5,
                    }}
                >
                    {callerName}
                </Typography>

                <Typography
                    sx={{
                        color: "#94A3B8",
                        fontSize: "14px",
                        mb: 0.5,
                    }}
                >
                    {callerRole}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mb: 1,
                    }}
                >
                    {hasVideo ? (
                        <Videocam sx={{ color: "#22C55E", fontSize: 20 }} />
                    ) : (
                        <VideocamOff sx={{ color: "#64748B", fontSize: 20 }} />
                    )}
                    <Typography
                        sx={{
                            color: isRinging ? "#22C55E" : "#94A3B8",
                            fontSize: "13px",
                            fontWeight: isRinging ? 600 : 400,
                            animation: isRinging ? "blink 1s infinite" : "none",
                            "@keyframes blink": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0.3 },
                            },
                        }}
                    >
                        {isRinging ? "Incoming call..." : "Call in progress"}
                    </Typography>
                </Box>

                {/* Controls */}
                {isRinging ? (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 3,
                            justifyContent: "center",
                            mt: 3,
                        }}
                    >
                        {/* Reject Button */}
                        <Button
                            variant="contained"
                            onClick={() =>
                                onReject?.({
                                    callId: callData?.callId,
                                    roomId: callData?.roomId,
                                    rejectedBy: callData?.toUserId,
                                    fromUserId: callData?.fromUserId,
                                })
                            }
                            sx={{
                                minWidth: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "#EF4444",
                                "&:hover": { background: "#DC2626" },
                                boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                            }}
                        >
                            <CallEnd sx={{ fontSize: 32 }} />
                        </Button>

                        {/* Accept Button */}
                        <Button
                            variant="contained"
                            onClick={() =>
                                onAccept?.({
                                    callId: callData?.callId,
                                    roomId: callData?.roomId,
                                    acceptedBy: callData?.toUserId,
                                    fromUserId: callData?.fromUserId,
                                })
                            }
                            sx={{
                                minWidth: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "#22C55E",
                                "&:hover": { background: "#16A34A" },
                                boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
                                position: "relative",
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    top: -4,
                                    left: -4,
                                    right: -4,
                                    bottom: -4,
                                    borderRadius: "50%",
                                    border: "3px solid #22C55E",
                                    animation: "pulse-ring 1.5s ease-in-out infinite",
                                },
                                "@keyframes pulse-ring": {
                                    "0%": {
                                        transform: "scale(1)",
                                        opacity: 0.5,
                                    },
                                    "100%": {
                                        transform: "scale(1.15)",
                                        opacity: 0,
                                    },
                                },
                            }}
                        >
                            <Phone sx={{ fontSize: 32 }} />
                        </Button>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "center",
                            mt: 3,
                            flexWrap: "wrap",
                        }}
                    >
                        <IconButton
                            sx={{
                                width: 56,
                                height: 56,
                                background: "#1E293B",
                                color: "#F8FAFC",
                                "&:hover": { background: "#334155" },
                            }}
                        >
                            <VolumeUp />
                        </IconButton>

                        <IconButton
                            sx={{
                                width: 56,
                                height: 56,
                                background: "#1E293B",
                                color: "#F8FAFC",
                                "&:hover": { background: "#334155" },
                            }}
                        >
                            <Videocam />
                        </IconButton>

                        <IconButton
                            onClick={() =>
                                onHangup?.({
                                    callId: callData?.callId,
                                    roomId: callData?.roomId,
                                    endedBy: callData?.toUserId,
                                })
                            }
                            sx={{
                                width: 56,
                                height: 56,
                                background: "#EF4444",
                                color: "#fff",
                                "&:hover": { background: "#DC2626" },
                                boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                            }}
                        >
                            <CallEnd sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default IncomingCallScreen;