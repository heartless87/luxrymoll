import os
import sys
import subprocess
import argparse
from pathlib import Path


def all_drives_windows():
    """Return list of existing drive roots on Windows"""
    from string import ascii_uppercase
    drives = []
    for d in ascii_uppercase:
        drive = f"{d}:\\"
        if Path(drive).exists():
            drives.append(drive)
    return drives


def default_search_roots():
    """Return search roots depending on OS"""
    if os.name == "nt":
        return all_drives_windows()
    else:
        return [Path("/")]


def find_folder_by_name(target_name, start_paths=None, max_results=None):
    """Find folders with given name across system drives or given paths"""
    if start_paths is None:
        start_paths = default_search_roots()
    matches = []
    for start in start_paths:
        start = Path(start)
        try:
            for root, dirs, _ in os.walk(start, topdown=True):
                for d in dirs:
                    if d == target_name:
                        matches.append(str(Path(root) / d))
                        if max_results and len(matches) >= max_results:
                            return matches
        except (PermissionError, OSError):
            continue
    return matches


def get_base_dir(use_appdata: bool = False) -> Path:
    """Return base directory (home or AppData)"""
    home = Path.home()
    if use_appdata and sys.platform.startswith("win"):
        appdata = os.getenv("APPDATA") or os.getenv("LOCALAPPDATA")
        if appdata:
            return Path(appdata)
    return home


def create_deep_folder(base: Path, root_name: str, subdirs: list) -> Path:
    """Create nested folder structure"""
    parts = [root_name] + subdirs
    path = base.joinpath(*parts)
    path.mkdir(parents=True, exist_ok=True)
    return path


def hide_path(path: Path) -> Path:
    """Hide folder (cross-platform)"""
    path = Path(path)
    try:
        if sys.platform.startswith("win"):
            import ctypes
            FILE_ATTRIBUTE_HIDDEN = 0x02
            ret = ctypes.windll.kernel32.SetFileAttributesW(str(path), FILE_ATTRIBUTE_HIDDEN)
            if not ret:
                raise OSError("Failed to set hidden attribute on Windows")
            return path
        elif sys.platform == "darwin":
            subprocess.run(["chflags", "hidden", str(path)], check=True)
            return path
        else:
            # Linux/Unix: hidden by prefixing with dot
            if path.name.startswith("."):
                return path
            new_name = "." + path.name
            new_path = path.with_name(new_name)
            if new_path.exists():
                alt = new_path / path.name
                alt.mkdir(parents=True, exist_ok=True)
                return alt
            path.rename(new_path)
            return new_path
    except Exception as e:
        print(f"[WARN] Could not hide path ({path}): {e}")
        return path


def set_owner_only_permissions(path: Path):
    """Set owner-only permissions on POSIX"""
    path = Path(path)
    if os.name == "posix":
        try:
            os.chmod(str(path), 0o700)
        except Exception as e:
            print(f"[WARN] chmod failed: {e}")
    else:
        print("[INFO] Windows: not changing ACLs. Use icacls manually if needed.")


def write_test_file(path: Path):
    """Write info file inside created folder"""
    try:
        p = path / "info.txt"
        p.write_text("This folder was created by create_devicedatauserlxmoll.py\n")
    except Exception as e:
        print(f"[WARN] Could not write test file: {e}")


def read_or_create_userdata(usead):
    """Read 'userdata.txt' if exists, else create it."""
    userdata_file = Path(usead) / "userdata.txt"

    if userdata_file.exists():
        content = userdata_file.read_text(encoding="utf-8")
        print("File content:\n", content)
    else:
        print("File nahi mili, nayi file bana rahe hain...")
        try:
            userdata_file.parent.mkdir(parents=True, exist_ok=True)
            default_content = "New userdata file created.\n"
            userdata_file.write_text(default_content, encoding="utf-8")
            print(f"Nayi file create ho gayi: {userdata_file}")
            print("File content:\n", default_content)
        except Exception as e:
            print(f"[ERROR] File create karte waqt dikkat aayi: {e}")
    return userdata_file


def main():
    parser = argparse.ArgumentParser(description="Find or create Devicedatauserlxmoll folder.")
    parser.add_argument("--name", default="Devicedatauserlxmoll", help="Target folder name to find or create")
    parser.add_argument("--sub", nargs="*", default=["cache", "v1", "tmp"], help="Subfolders to create")
    parser.add_argument("--hide", action="store_true", help="Hide created folder")
    parser.add_argument("--use-appdata", action="store_true", help="Use APPDATA instead of home (Windows only)")
    parser.add_argument("--owner-only", action="store_true", help="Set permissions to owner-only (POSIX only)")
    parser.add_argument("--max-results", type=int, default=50, help="Max search results to return")

    args = parser.parse_args()

    results = find_folder_by_name(args.name, max_results=args.max_results)
    if results:
        print(f"Found {len(results)} result(s):")
        for r in results:
            print(r)
    else:
        print("[INFO] No existing folder found. Creating new one...")

        base = get_base_dir(use_appdata=args.use_appdata)
        print(f"[INFO] Base directory: {base}")

        final_path = create_deep_folder(base, args.name, args.sub)
        print(f"[INFO] Created: {final_path}")

        if args.hide:
            final_path = hide_path(final_path)
            print(f"[INFO] Hide attempted on: {final_path}")

        if args.owner_only:
            set_owner_only_permissions(final_path)
            print(f"[INFO] Owner-only permissions set on: {final_path}")

        write_test_file(final_path)
        print(f"[DONE] Final path: {final_path}")

        # ✅ Store final path in usead variable
        usead = final_path
        print(f"usead = {usead}")

        # ✅ Read or create userdata.txt inside that folder
        read_or_create_userdata(usead)

        print("You can place your app data inside this folder (with user consent).")


if __name__ == "__main__":
    main()
