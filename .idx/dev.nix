{ pkgs, ... }: {

  # This is a basic Nix configuration for Firebase Studio.
  # For more information, see https://firebase.google.com/docs/studio/customize-workspace

  # Environment packages.
  # Firebase Studio manages Node.js and npm versions.
  # You can uncomment and specify a specific Node.js version if needed, e.g.:
  # packages = [ pkgs.nodejs_20 ]; # For Node.js 20
  # Or rely on Studio's default Node.js environment which is usually suitable.
  packages = [ pkgs.nodejs pkgs.corepack_latest ];

  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
    previews = {
      web = {
        # This command tells Firebase Studio how to start your Next.js dev server.
        # It uses `npm run dev` and passes arguments to `next dev`
        # to use the port Studio provides ($PORT) and listen on all interfaces (0.0.0.0).
        command = [
          "npm"  # The command to run
          "run"  # npm subcommand
          "dev"  # Your script name in package.json (which is now just "next dev")
          "--"   # Separator: arguments after this are passed to the script `next dev`
          "."    # The project directory (current directory)
          "--port"
          "$PORT" # Firebase Studio injects this environment variable for the port
          "--hostname"
          "0.0.0.0" # Listen on all network interfaces
        ];
        manager = "web"; # Indicates this is a web preview
      };
    };
  };
}
