import Button from "@mui/material/Button";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const page = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1>Portal Page</h1>
      <Button
        type="link"
        href="/dashboard/tutor"
        variant="primary"
        startIcon={<SchoolIcon />}
      >
        Tutor Dashboard
      </Button>

      <Button
        type="link"
        href="/dashboard/assistant"
        variant="primary"
        startIcon={<GroupsIcon />}
      >
        Teaching Assistant Dashboard
      </Button>

      <Button
        type="link"
        href="/dashboard/coordinator"
        variant="primary"
        startIcon={<EventAvailableIcon />}
      >
        Coordinator Dashboard
      </Button>

      <Button
        type="link"
        href="/dashboard/admin"
        variant="primary"
        startIcon={<AdminPanelSettingsIcon />}
      >
        System Admin Dashboard
      </Button>
    </div>
  );
};

export default page;
