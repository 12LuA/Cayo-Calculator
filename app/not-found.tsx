import Link from "next/link"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Particles } from "@/components/ui/particles"

export default function NotFound() {
  return (
    <Particles>
      <Empty className="relative z-10 min-h-[80vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Info />
          </EmptyMedia>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist. Try searching for
            what you need below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </Particles>
  )
}
