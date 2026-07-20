import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Paper,
    IconButton,
    CircularProgress,
    Chip,
    Fade,
    Zoom,
    Modal,
    Backdrop,
} from "@mui/material";
import {
    Phone,
    CallEnd,
    Videocam,
    VideocamOff,
    VolumeUp,
    VolumeOff,
    Person,
    AccessTime,
    Circle,
    Mic,
    MicOff,
    ScreenShare,
    MoreVert,
    PhoneForwarded,
    Close,
    NotificationsOff,
} from "@mui/icons-material";
import ringtone from "../../assets/ringtone.mp3";

const IncomingCallScreen = ({
    callData,
    onAccept,
    onReject,
    onHangup,
    isRinging = true,
    callerImage,
    open = true,
    onClose,
}) => {
    const callerName = callData?.callerName || "Unknown Caller";
    const callerRole = callData?.callerRole || "Physician";
    const hasVideo = callData?.hasVideo !== false;
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!hasVideo);
    const [callDuration, setCallDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const audioRef = useRef(null);

    const stopRingtone = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    // Play ringtone when incoming call is active
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(ringtone);
            audioRef.current.loop = true;
        }

        if (isRinging && open) {
            audioRef.current.play().catch(err => console.log("Ringtone play failed:", err));
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [isRinging, open]);

    // Auto-dismiss ringing after 30 seconds
    useEffect(() => {
        if (!isRinging || !open) return;
        const timer = setTimeout(() => {
            onReject?.({
                callId: callData?.callId,
                roomId: callData?.roomId,
                rejectedBy: callData?.toUserId,
                fromUserId: callData?.fromUserId,
            });
        }, 30000);

        return () => clearTimeout(timer);
    }, [isRinging, callData, onReject, open]);

    // Call duration timer
    useEffect(() => {
        if (isRinging || !open) return;
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isRinging, open]);

    // Auto-hide controls after 5 seconds in active call
    useEffect(() => {
        if (isRinging || isHovering || !open) return;
        const timer = setTimeout(() => {
            setShowControls(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isRinging, isHovering, open]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Background gradient based on call state
    const gradientColors = isRinging
        ? ['#667eea', '#764ba2', '#f093fb']
        : ['#43e97b', '#38f9d7'];

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backdropFilter: "blur(10px)",
                    background: "rgba(0, 0, 0, 0.7)",
                },
            }}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <Fade in={open} timeout={400}>
                <Box
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 480,
                        mx: 2,
                        outline: "none",
                    }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: "28px",
                            background: "linear-gradient(135deg, #1a1a3e 0%, #0a0a1a 100%)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 60px rgba(102,126,234,0.1)",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at 30% 20%, rgba(102,126,234,0.08) 0%, transparent 50%),
                                           radial-gradient(circle at 70% 80%, rgba(118,75,162,0.08) 0%, transparent 50%)`,
                                pointerEvents: "none",
                            },
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                borderRadius: "30px",
                                background: `linear-gradient(45deg, ${gradientColors.join(', ')})`,
                                opacity: 0.1,
                                zIndex: -1,
                            },
                        }}
                    >
                        {/* Animated Border Ring for Incoming Call */}
                        {isRinging && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: -4,
                                    left: -4,
                                    right: -4,
                                    bottom: -4,
                                    borderRadius: "32px",
                                    border: "2px solid transparent",
                                    background: `linear-gradient(45deg, ${gradientColors.join(', ')}) border-box`,
                                    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    maskComposite: "exclude",
                                    animation: "rotateBorder 3s linear infinite",
                                    "@keyframes rotateBorder": {
                                        "0%": { transform: "rotate(0deg)" },
                                        "100%": { transform: "rotate(360deg)" },
                                    },
                                }}
                            />
                        )}

                        {/* Close Button */}
                        {onClose && (
                            <IconButton
                                onClick={onClose}
                                sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    color: "rgba(255,255,255,0.4)",
                                    background: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    width: 36,
                                    height: 36,
                                    "&:hover": {
                                        background: "rgba(255,255,255,0.1)",
                                        color: "#ffffff",
                                    },
                                    zIndex: 1,
                                }}
                            >
                                <Close sx={{ fontSize: 20 }} />
                            </IconButton>
                        )}

                        {/* Status Chip */}
                        <Chip
                            icon={<Circle sx={{ fontSize: 8, color: isRinging ? '#22c55e' : '#3b82f6' }} />}
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    {isRinging ? "Incoming Call" : "Connected"}
                                    {!isRinging && (
                                        <>
                                            <AccessTime sx={{ fontSize: 14, ml: 0.5 }} />
                                            {formatDuration(callDuration)}
                                        </>
                                    )}
                                </Box>
                            }
                            sx={{
                                position: "absolute",
                                top: 16,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: isRinging
                                    ? "rgba(34, 197, 94, 0.12)"
                                    : "rgba(59, 130, 246, 0.12)",
                                color: isRinging ? "#22c55e" : "#3b82f6",
                                border: `1px solid ${isRinging ? "rgba(34, 197, 94, 0.2)" : "rgba(59, 130, 246, 0.2)"}`,
                                fontWeight: 600,
                                fontSize: "12px",
                                backdropFilter: "blur(10px)",
                                px: 1,
                                "& .MuiChip-label": {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                },
                            }}
                        />

                        {/* Avatar Section */}
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mt: 5,
                        }}>
                            <Box sx={{ position: "relative", display: "inline-block" }}>
                                {/* Glow Effect */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 160,
                                        height: 160,
                                        background: isRinging
                                            ? "radial-gradient(circle, rgba(102, 126, 234, 0.25) 0%, transparent 70%)"
                                            : "radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)",
                                        borderRadius: "50%",
                                        animation: isRinging ? "pulseGlow 2s ease-in-out infinite" : "none",
                                        "@keyframes pulseGlow": {
                                            "0%, 100%": {
                                                transform: "translate(-50%, -50%) scale(1)",
                                                opacity: 0.5
                                            },
                                            "50%": {
                                                transform: "translate(-50%, -50%) scale(1.15)",
                                                opacity: 1
                                            },
                                        },
                                    }}
                                />

                                {/* Avatar */}
                                <Zoom in timeout={500}>
                                    <Avatar
                                        src={callerImage}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            fontSize: 40,
                                            fontWeight: 700,
                                            border: "3px solid rgba(255,255,255,0.1)",
                                            boxShadow: "0 12px 40px rgba(102, 126, 234, 0.3)",
                                            position: "relative",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {getInitials(callerName)}
                                    </Avatar>
                                </Zoom>

                                {/* Progress Ring for Incoming Call */}
                                {isRinging && (
                                    <CircularProgress
                                        size={116}
                                        thickness={2}
                                        sx={{
                                            position: "absolute",
                                            top: -8,
                                            left: -8,
                                            color: "#667eea",
                                            animation: "spin 1.5s linear infinite",
                                            "@keyframes spin": {
                                                "0%": { transform: "rotate(0deg)" },
                                                "100%": { transform: "rotate(360deg)" },
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Caller Info */}
                        <Fade in timeout={600}>
                            <Box sx={{ mt: 2.5, textAlign: "center" }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#ffffff",
                                        mb: 0.5,
                                        letterSpacing: "-0.3px",
                                    }}
                                >
                                    {callerName}
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "rgba(255,255,255,0.6)",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.5,
                                    }}
                                >
                                    <Person sx={{ fontSize: 16 }} />
                                    {callerRole}
                                </Typography>

                                {/* Call Type Indicator */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 1,
                                        mt: 1.5,
                                        p: 0.5,
                                        px: 2,
                                        borderRadius: "50px",
                                        background: "rgba(255,255,255,0.04)",
                                        backdropFilter: "blur(10px)",
                                        width: "fit-content",
                                        mx: "auto",
                                        border: "1px solid rgba(255,255,255,0.04)",
                                    }}
                                >
                                    {hasVideo ? (
                                        <Videocam sx={{ color: "#22C55E", fontSize: 18 }} />
                                    ) : (
                                        <VideocamOff sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
                                    )}
                                    <Typography
                                        sx={{
                                            color: isRinging ? "#22C55E" : "#3B82F6",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            animation: isRinging ? "blink 1s infinite" : "none",
                                            "@keyframes blink": {
                                                "0%, 100%": { opacity: 1 },
                                                "50%": { opacity: 0.3 },
                                            },
                                        }}
                                    >
                                        {isRinging
                                            ? hasVideo ? "Video Call" : "Audio Call"
                                            : `Call in progress • ${formatDuration(callDuration)}`
                                        }
                                    </Typography>
                                </Box>
                            </Box>
                        </Fade>

                        {/* Controls Section */}
                        <Fade in timeout={700}>
                            <Box sx={{ mt: 3 }}>
                                {isRinging ? (
                                    // Incoming Call Controls - Accept/Decline
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 4,
                                            justifyContent: "center",
                                        }}
                                    >
                                        {/* Decline Button */}
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                            <IconButton
                                                onClick={() => {
                                                    stopRingtone();
                                                    onReject?.({
                                                        callId: callData?.callId,
                                                        roomId: callData?.roomId,
                                                        rejectedBy: callData?.toUserId,
                                                        fromUserId: callData?.fromUserId,
                                                    });
                                                }}
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                    color: "#ffffff",
                                                    "&:hover": {
                                                        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    boxShadow: "0 8px 24px rgba(239,68,68,0.4)",
                                                    transition: "all 0.3s ease",
                                                    position: "relative",
                                                    "&::after": {
                                                        content: '""',
                                                        position: "absolute",
                                                        top: -3,
                                                        left: -3,
                                                        right: -3,
                                                        bottom: -3,
                                                        borderRadius: "50%",
                                                        border: "2px solid rgba(239,68,68,0.2)",
                                                        animation: "ripple 2s infinite",
                                                    },
                                                    "@keyframes ripple": {
                                                        "0%": { transform: "scale(1)", opacity: 0.5 },
                                                        "100%": { transform: "scale(1.15)", opacity: 0 },
                                                    },
                                                }}
                                            >
                                                <CallEnd sx={{ fontSize: 28 }} />
                                            </IconButton>
                                            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 500 }}>
                                                Decline
                                            </Typography>
                                        </Box>

                                        {/* Accept Button */}
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                            <IconButton
                                                onClick={() => {
                                                    stopRingtone();
                                                    onAccept?.({
                                                        callId: callData?.callId,
                                                        roomId: callData?.roomId,
                                                        acceptedBy: callData?.toUserId,
                                                        fromUserId: callData?.fromUserId,
                                                    });
                                                }}
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                                    color: "#ffffff",
                                                    "&:hover": {
                                                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
                                                    transition: "all 0.3s ease",
                                                    position: "relative",
                                                    "&::before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        top: -4,
                                                        left: -4,
                                                        right: -4,
                                                        bottom: -4,
                                                        borderRadius: "50%",
                                                        background: "rgba(34,197,94,0.15)",
                                                        animation: "pulseRing 1.5s ease-in-out infinite",
                                                    },
                                                    "@keyframes pulseRing": {
                                                        "0%": { transform: "scale(1)", opacity: 0.8 },
                                                        "100%": { transform: "scale(1.2)", opacity: 0 },
                                                    },
                                                }}
                                            >
                                                <PhoneForwarded sx={{ fontSize: 28 }} />
                                            </IconButton>
                                            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 500 }}>
                                                Accept
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    // Active Call Controls
                                    <Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1.5,
                                                justifyContent: "center",
                                                flexWrap: "wrap",
                                                opacity: showControls ? 1 : 0.2,
                                                transition: "all 0.5s ease",
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => setIsMuted(!isMuted)}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: isMuted
                                                        ? "rgba(239,68,68,0.2)"
                                                        : "rgba(255,255,255,0.05)",
                                                    color: isMuted ? "#ef4444" : "#ffffff",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    "&:hover": {
                                                        background: isMuted
                                                            ? "rgba(239,68,68,0.3)"
                                                            : "rgba(255,255,255,0.1)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                {isMuted ? <MicOff sx={{ fontSize: 22 }} /> : <Mic sx={{ fontSize: 22 }} />}
                                            </IconButton>

                                            <IconButton
                                                onClick={() => setIsVideoOff(!isVideoOff)}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: isVideoOff
                                                        ? "rgba(239,68,68,0.2)"
                                                        : "rgba(255,255,255,0.05)",
                                                    color: isVideoOff ? "#ef4444" : "#ffffff",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    "&:hover": {
                                                        background: isVideoOff
                                                            ? "rgba(239,68,68,0.3)"
                                                            : "rgba(255,255,255,0.1)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                {isVideoOff ? <VideocamOff sx={{ fontSize: 22 }} /> : <Videocam sx={{ fontSize: 22 }} />}
                                            </IconButton>

                                            <IconButton
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: "rgba(255,255,255,0.05)",
                                                    color: "#ffffff",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    "&:hover": {
                                                        background: "rgba(255,255,255,0.1)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                <ScreenShare sx={{ fontSize: 22 }} />
                                            </IconButton>

                                            <IconButton
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: "rgba(255,255,255,0.05)",
                                                    color: "#ffffff",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    "&:hover": {
                                                        background: "rgba(255,255,255,0.1)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                <VolumeUp sx={{ fontSize: 22 }} />
                                            </IconButton>

                                            {/* Hangup Button */}
                                            <IconButton
                                                onClick={() =>
                                                    onHangup?.({
                                                        callId: callData?.callId,
                                                        roomId: callData?.roomId,
                                                        endedBy: callData?.toUserId,
                                                    })
                                                }
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                    color: "#ffffff",
                                                    "&:hover": {
                                                        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                                                        transform: "scale(1.05)",
                                                    },
                                                    boxShadow: "0 8px 20px rgba(239,68,68,0.4)",
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                <CallEnd sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Box>

                                        {/* Tap hint */}
                                        {!showControls && (
                                            <Typography
                                                sx={{
                                                    color: "rgba(255,255,255,0.15)",
                                                    fontSize: "10px",
                                                    mt: 1.5,
                                                    letterSpacing: "0.3px",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Tap to show controls
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Fade>

                        {/* Security Badge */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.5,
                                mt: 2.5,
                                color: "rgba(255,255,255,0.15)",
                                fontSize: "10px",
                                letterSpacing: "0.3px",
                            }}
                        >
                            <Circle sx={{ fontSize: 5, color: "#22c55e" }} />
                            End-to-end encrypted
                        </Box>
                    </Paper>
                </Box>
            </Fade>
        </Modal>
    );
};

export default IncomingCallScreen;